from django.db import models
from django.contrib.auth.models import User

class AcademicDay(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    is_working_day = models.BooleanField(default=True)
    class Meta:
        unique_together = ('user', 'date')

class Subject(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    attended_classes = models.IntegerField(default=0)
    conducted_classes = models.IntegerField(default=0)

class WeeklySchedule(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    day_choices = [(i, d) for i, d in enumerate(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])]
    day_of_week = models.IntegerField(choices=day_choices)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)