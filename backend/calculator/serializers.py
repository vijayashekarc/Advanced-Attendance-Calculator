from rest_framework import serializers
from .models import AcademicDay, Subject, WeeklySchedule

class AcademicDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicDay
        fields = ['date', 'is_working_day']

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'attended_classes', 'conducted_classes']
        
class WeeklyScheduleSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    class Meta:
        model = WeeklySchedule
        fields = ['id', 'day_of_week', 'subject', 'subject_name']