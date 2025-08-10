from django.http import HttpResponse
from django.views.decorators.cache import cache_control
from django.views.decorators.http import require_GET
import base64

@require_GET
@cache_control(max_age=86400)  # Cache for 24 hours
def favicon_view(request):
    """Serve a simple favicon"""
    # Simple SVG favicon with dollar sign
    svg_favicon = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#8b45ff;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="16" fill="url(#grad)"/>
        <path d="M12 8h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-2v4h-2V8zm2 2v4h2c1.1 0 2-.9 2-2s-.9-2-2-2h-2z" fill="white"/>
        <rect x="14" y="6" width="2" height="4" fill="white"/>
        <rect x="14" y="22" width="2" height="4" fill="white"/>
    </svg>'''
    
    return HttpResponse(svg_favicon, content_type='image/svg+xml')
