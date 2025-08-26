document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('.navbar-nav .nav-link, .offcanvas-body .nav-link').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const offsetTop = targetElement.offsetTop - navbarHeight;

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Close offcanvas menu after clicking a link (for mobile)
                const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasNavbar'));
                if (offcanvas) {
                    offcanvas.hide();
                }
            }
        });
    });

    // Add active class to nav links on scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link, .offcanvas-body .nav-link');

    const activateNavLink = () => {
        let currentActive = null;
        sections.forEach(section => {
            const sectionTop = section.offsetTop - document.querySelector('.navbar').offsetHeight - 50;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
                currentActive = section.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + currentActive) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', activateNavLink);
    activateNavLink(); // Call on load to set initial active link

    // Gemini API Integration for Project Description Enhancement
    const enhanceButtons = document.querySelectorAll('.enhance-description-btn');
    const enhancedDescriptionContent = document.getElementById('enhancedDescriptionContent');

    enhanceButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const projectDescriptionElement = this.closest('.card-body').querySelector('.project-description');
            const projectDescription = projectDescriptionElement ? projectDescriptionElement.textContent.trim() : 'No description available.';

            // Show loading spinner
            enhancedDescriptionContent.innerHTML = `
                <div class="d-flex justify-content-center align-items-center py-5">
                    <div class="spinner-border text-purple-dark" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            `;

            const prompt = `Elaborate on this project description in a more detailed and engaging way, suitable for a professional portfolio. Focus on the impact and key features. Keep it concise, around 3-4 sentences.
            
            Project Description: "${projectDescription}"`;

            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            const payload = { contents: chatHistory };
            const apiKey = ""; // Canvas will automatically provide the API key
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    const text = result.candidates[0].content.parts[0].text;
                    enhancedDescriptionContent.innerHTML = text;
                } else {
                    enhancedDescriptionContent.innerHTML = '<p class="text-danger">Could not generate an enhanced description. Please try again.</p>';
                    console.error('Gemini API response structure unexpected:', result);
                }
            } catch (error) {
                enhancedDescriptionContent.innerHTML = `<p class="text-danger">Error fetching enhanced description: ${error.message}</p>`;
                console.error('Error calling Gemini API:', error);
            }
        });
    });
});