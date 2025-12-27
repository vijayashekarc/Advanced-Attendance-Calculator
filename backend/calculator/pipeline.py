from social_core.exceptions import AuthForbidden

def restrict_email_domain(backend, details, response, *args, **kwargs):
    if backend.name == 'google-oauth2':
        email = details.get('email')
        
        # 1. Check if email exists
        if not email:
            raise AuthForbidden(backend)
            
        # 2. TEMPORARY CHANGE: Allow Gmail for testing
        # Change '@klu.ac.in' -> '@gmail.com'
        if not email.endswith('@klu.ac.in'): 
            raise AuthForbidden(backend)