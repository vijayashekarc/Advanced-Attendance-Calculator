from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'timetable', ScheduleViewSet, basename='timetable')

urlpatterns = [
    path('auth/google/', google_login, kwargs={'backend': 'google-oauth2'}),
    path('calendar/list/', get_calendar_data),
    path('calendar/init/', initialize_semester),
    path('calendar/toggle/', toggle_day_status),
    path('analyze/', analyze_attendance),
    path('', include(router.urls)),
]