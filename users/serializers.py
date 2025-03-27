from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'user_type',
                 'phone_number', 'profile_picture', 'bio', 'skills', 'education',
                 'experience', 'resume')
        read_only_fields = ('id',)

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=False)  # Make password2 optional
    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'user_type', 'phone_number',
                  'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'user_type': {'required': False},
            'phone_number': {'required': False},
        }

    def validate(self, attrs):
        # If password2 is provided, check if it matches password
        if 'password2' in attrs and attrs.get('password') != attrs.get('password2'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        # Remove password2 if it exists
        if 'password2' in validated_data:
            validated_data.pop('password2')
        
        # Ensure user_type has a default value
        if 'user_type' not in validated_data or not validated_data['user_type']:
            validated_data['user_type'] = 'student'
        
        user = User.objects.create_user(**validated_data)
        return user 