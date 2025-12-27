from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from social_django.utils import psa
from datetime import date, timedelta, datetime
import math as m  # Imported as 'm' to match your snippet
from .models import Subject, WeeklySchedule, AcademicDay
from .serializers import SubjectSerializer, WeeklyScheduleSerializer, AcademicDaySerializer

# --- AUTH VIEW ---
@api_view(['POST'])
@permission_classes([AllowAny])
@psa('social:complete')
def google_login(request, backend):
    token = request.data.get('access_token')
    try:
        user = request.backend.do_auth(token)
    except Exception as e:
        return Response({'error': str(e)}, status=400)
    
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'auth_token': token.key})
    else:
        return Response({'error': 'Login Failed'}, status=400)

# --- CALENDAR VIEWS ---
@api_view(['GET'])
def get_calendar_data(request):
    days = AcademicDay.objects.filter(user=request.user)
    return Response(AcademicDaySerializer(days, many=True).data)

@api_view(['POST'])
def initialize_semester(request):
    try:
        # Front end sends 'start_date' and 'end_date'
        start = datetime.strptime(request.data['start_date'], '%Y-%m-%d').date()
        end = datetime.strptime(request.data['end_date'], '%Y-%m-%d').date()
    except KeyError:
        return Response({'error': 'Missing start_date or end_date'}, status=400)

    curr = start
    while curr <= end:
        # Default: Weekends (Sat=5, Sun=6) are holidays
        is_weekend = curr.weekday() >= 5
        AcademicDay.objects.get_or_create(
            user=request.user, 
            date=curr, 
            defaults={'is_working_day': not is_weekend}
        )
        curr += timedelta(days=1)
    return Response({'status': 'done'})

@api_view(['POST'])
def toggle_day_status(request):
    d_obj, _ = AcademicDay.objects.get_or_create(user=request.user, date=request.data['date'])
    d_obj.is_working_day = not d_obj.is_working_day
    d_obj.save()
    return Response({'status': 'ok'})

# --- CRUD VIEWSETS ---
class SubjectViewSet(viewsets.ModelViewSet):
    serializer_class = SubjectSerializer
    def get_queryset(self): return Subject.objects.filter(user=self.request.user)
    def perform_create(self, serializer): serializer.save(user=self.request.user)

class ScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = WeeklyScheduleSerializer
    def get_queryset(self): return WeeklySchedule.objects.filter(user=self.request.user)
    def perform_create(self, serializer): serializer.save(user=self.request.user)

# --- ANALYSIS LOGIC (YOUR CODE HERE) ---
def get_currentAttendance(attended, conducted):
    return (attended / conducted) * 100 if conducted > 0 else 0

@api_view(['POST'])
def analyze_attendance(request):
    user_inputs = request.data
    user = request.user

    # 1. Fetch ALL Semester Days
    all_semester_days = AcademicDay.objects.filter(user=user, is_working_day=True)
    
    # 2. Build Schedule Map
    schedule_map = {i: [] for i in range(7)}
    for entry in WeeklySchedule.objects.filter(user=user).select_related('subject'):
        schedule_map[entry.day_of_week].append(entry.subject.name)
        
    # 3. Calculate Total Semester Classes
    total_semester_classes = {}
    for d in all_semester_days:
        weekday = d.date.weekday()
        subjects_on_this_day = schedule_map.get(weekday, [])
        for subj in subjects_on_this_day:
            total_semester_classes[subj] = total_semester_classes.get(subj, 0) + 1
            
    results = []
    
    for subject_name, data in user_inputs.items():
        try:
            attended = int(data.get('attended', 0))
            conducted = int(data.get('conducted', 0))
        except (ValueError, TypeError):
            continue

        total_classes_in_sem = total_semester_classes.get(subject_name, 0)
        
        # Classes Left
        classes_left = total_classes_in_sem - conducted
        if classes_left < 0: classes_left = 0

        # Semester Math
        workingHr = total_classes_in_sem
        if workingHr == 0: continue

        to_attend_total = m.ceil(0.75 * workingHr)
        total_bunk_budget = workingHr - to_attend_total
        missed_so_far = conducted - attended
        
        bunkable = total_bunk_budget - missed_so_far
        current_pct = (attended / conducted * 100) if conducted > 0 else 0
        
        # --- 1. IMMEDIATE RECOVERY (Must Attend Now) ---
        must_attend = 0
        if current_pct < 75:
            req = (3 * conducted) - (4 * attended)
            must_attend = req if req > 0 else 0
            
        # --- 2. LONG TERM GOAL (Need till end) ---
        # Formula: (Total Target) - (Already Attended)
        needed_till_end = to_attend_total - attended
        if needed_till_end < 0: needed_till_end = 0
        
        # If impossible (remaining classes < needed)
        if needed_till_end > classes_left:
             # This handles the "Impossible" case for the total goal
             pass 

        # --- STATUS MSG ---
        status_msg = "Safe"
        advice = ""
        
        if current_pct < 75:
            if must_attend > classes_left:
                status_msg = "Impossible"
                advice = "Cannot reach 75% even if you attend all."
            else:
                status_msg = "Critical"
                advice = f"Attend next {must_attend} classes immediately to reach 75%."
        elif bunkable >= 0:
            status_msg = "Safe"
            advice = f"Safe. You have {bunkable} bunks left."
        else:
            status_msg = "Danger"
            advice = "Percentage is good, but you are short on hours for the semester."

        results.append({
            "subject": subject_name,
            "current_percentage": round(current_pct, 2),
            "status": status_msg,
            "bunkable": bunkable,
            "advice": advice,
            "classes_left": classes_left,
            "must_attend": must_attend,
            "needed_till_end": needed_till_end, # <--- NEW DATA
            "total_target": to_attend_total
        })
        
    return Response(results)