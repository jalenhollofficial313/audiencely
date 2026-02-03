// Scroll animation for the "How it works" section
function initScrollAnimations() {
    const scrollSections = document.querySelectorAll('.scroll-section');
    
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('opacity-0', 'translate-y-8');
                entry.target.classList.add('opacity-100', 'translate-y-0');
            }
        });
    }, observerOptions);
    
    scrollSections.forEach(section => {
        observer.observe(section);
    });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// FAQ accordion functionality
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const icon = question.querySelector('.faq-icon');
            const isOpen = !answer.classList.contains('hidden');
            
            // Close all other FAQs
            document.querySelectorAll('.faq-answer').forEach(otherAnswer => {
                if (otherAnswer !== answer) {
                    otherAnswer.classList.add('hidden');
                }
            });
            
            document.querySelectorAll('.faq-icon').forEach(otherIcon => {
                if (otherIcon !== icon) {
                    otherIcon.style.transform = 'rotate(0deg)';
                }
            });
            
            // Toggle current FAQ
            if (isOpen) {
                answer.classList.add('hidden');
                icon.style.transform = 'rotate(0deg)';
            } else {
                answer.classList.remove('hidden');
                icon.style.transform = 'rotate(45deg)';
            }
        });
    });
}

const FIREBASE_DB_URL = 'https://audiencely-default-rtdb.firebaseio.com';

async function fetchSignupCount() {
    const response = await fetch(`${FIREBASE_DB_URL}/signups.json`);
    if (!response.ok) {
        throw new Error('Failed to load signups');
    }
    const data = await response.json();
    if (!data) {
        return 0;
    }
    return Object.keys(data).length;
}

async function createSignup(email) {
    const response = await fetch(`${FIREBASE_DB_URL}/signups.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            createdAt: new Date().toISOString(),
            source: 'landing',
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to save signup');
    }

    return response.json();
}

async function updateSignupCount() {
    const countEl = document.getElementById('signup-count');
    if (!countEl) {
        return;
    }
    try {
        const count = await fetchSignupCount();
        countEl.textContent = count.toString();
    } catch (error) {
        console.error(error);
    }
}

// Email capture functionality
function initEmailCapture() {
    const form = document.getElementById('hero-email-form');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById('hero-email-input');
            const submitBtn = document.getElementById('hero-submit-btn');
            const message = document.getElementById('hero-form-message');
            const email = emailInput.value.trim();
            
            // Disable form while submitting
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            message.classList.add('hidden');
            
            try {
                await createSignup(email);
                message.textContent = 'Thanks! You are on the waitlist.';
                message.classList.remove('hidden', 'text-red-600');
                message.classList.add('text-green-600');
                emailInput.value = '';
                await updateSignupCount();
            } catch (error) {
                message.textContent = error.message || 'Failed to submit. Please try again.';
                message.classList.remove('hidden', 'text-green-600');
                message.classList.add('text-red-600');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Get early access';
            }
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initSmoothScroll();
    initFAQ();
    initEmailCapture();
    updateSignupCount();
});