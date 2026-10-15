# Harsh Kumar Chaubey --- Portfolio Website Specification

## Project Goal

Build a polished, premium, futuristic personal portfolio website for
**Harsh Kumar Chaubey**, a Computer Science & Engineering undergraduate
specializing in **AI/ML**. The site should present his profile, skills,
experience, certifications, and projects in a recruiter-friendly way
while still feeling visually memorable.

## Tech Stack

-   **Backend:** Python + Flask
-   **Frontend:** HTML5, CSS3, vanilla JavaScript
-   **Optional enhancements:** lightweight libraries only where they
    genuinely improve the experience
-   **Responsive:** desktop, tablet, and mobile
-   Keep the project simple to run locally and easy to deploy.

## Visual Direction

Use a **futuristic, premium, high-tech** style: - Deep navy / near-black
background - Neon cyan highlights and restrained Supra-inspired red
accents - Glassmorphism panels, subtle gradients, fine borders, soft
glows, and generous spacing - Modern typography with clear hierarchy -
Smooth scrolling and polished transitions - Attractive, dynamic movement
without making the site distracting or slow - Avoid clutter, excessive
animation, or unreadably small text

## Profile Image

Use the uploaded portrait image provided with this request. The image
asset should be named **`image.png`** and stored at:

`static/images/image.png`

Use it in the hero section as a professional portrait. Crop with
`object-fit: cover`, preserve the face, and give the image a subtle
border/glow that matches the theme. Do not replace it with a stock photo
or generate a different face.

## Verified Profile Content

Use the following details from the supplied CV/resume. Do not invent
employers, dates, awards, links, or project outcomes.

### Name and headline

**Harsh Kumar Chaubey**\
**Computer Science Undergraduate \| AI/ML \| Full-Stack Development**

### Contact and links

-   Location: Garhwa, Jharkhand, India
-   Email: `harshchaubey2123@gmail.com`
-   LinkedIn: `https://linkedin.com/in/harshkumarchaubey`
-   GitHub: `https://github.com/harsh-chaubey`

Make email and social links clickable. Open external profiles in a new
tab with appropriate security attributes.

### About

Suggested copy: \> I'm a Computer Science and Engineering undergraduate
specializing in AI/ML, with hands-on experience in software development,
web applications, IoT, and data-driven problem-solving. I enjoy building
practical solutions using Python, Flask, React, JavaScript, SQL, and
MongoDB, and I'm continuing to grow my skills through projects,
training, and collaborative challenges.

### Education

**B.Tech in Computer Science & Engineering (AI/ML)**\
NIST University, Berhampur, Odisha\
2024--2028 · Expected graduation: 2028

### Experience and training

1.  **IT Intern --- Aditya Birla Grasim Industries Limited, IT
    Department**\
    June 2026 -- July 2026
    -   Gained practical exposure to IT workflows and a professional
        industry environment.
2.  **AI & Machine Learning Training --- KODACY in collaboration with
    SPACE**\
    30-day training
    -   Gained hands-on exposure to AI/ML concepts.
    -   Applied AI/ML concepts to practical problem-solving tasks.
3.  **IoT & Mechatronics Training --- NIST University**\
    June 2025 -- July 2025
    -   Built a smart fan control system using real-time temperature and
        humidity data to automatically adjust fan speed.
    -   Learned about IoT architecture, sensor integration,
        microcontrollers, actuators, wireless communication, and
        real-time data collection.

### Projects

Create visually appealing project cards with a short summary, technology
tags, and links only when real project URLs are provided. Do not invent
GitHub repositories or live demos.

1.  **Smart India Hackathon 2025 --- Internal Round Qualifier**\
    Role: Frontend Developer
    -   Built a prototype for real-time public transportation tracking
        using HTML, CSS, and JavaScript.
    -   Used Leaflet for interactive map visualization and Tailwind CSS
        for responsive UI.
2.  **Hospital Management System**\
    Technologies: Flask, Python, HTML, CSS, JavaScript, MongoDB
    -   Built a system to manage patients, doctors, and appointments.
    -   Implemented REST APIs and CRUD operations for data handling and
        automation.
    -   Designed a responsive interface and maintainable backend
        structure.
3.  **Smart Fan Control System**\
    Technologies: IoT, sensors, microcontrollers
    -   Built a prototype that uses real-time temperature and humidity
        readings to adjust fan speed automatically.

### Skills

Show skills as compact groups or tags, not inflated proficiency bars: -
**Languages:** Python, SQL, JavaScript - **Web development:** HTML, CSS,
React.js, Flask, REST APIs - **Database:** MongoDB - **AI/ML and data:**
AI/ML fundamentals, Pandas, Scikit-learn - **Core CS:** Data Structures
& Algorithms, Computer Networking - **IoT:** Sensors, microcontrollers,
automation

### Certifications

-   Generative AI Professional --- Oracle Cloud Infrastructure
-   Data Analytics Job Simulation --- Deloitte
-   Introduction to AI --- KODACY
-   YUVA AI for ALL --- IndiaAI
-   Basics of IoT and Mechatronics --- NIST University

### Languages

English, Hindi

## Website Structure

### 1. Navigation

-   Brand text: `HARSH CHAUBEY` or `HC.`
-   Links: Home, About, Experience, Projects, Skills, Certifications,
    Contact
-   Sticky navigation with a subtle background blur
-   Mobile hamburger menu with keyboard-accessible controls

### 2. Hero section

-   Two-column layout on desktop; stacked layout on mobile
-   Left: small availability/role eyebrow (do not claim that he is
    currently available for work unless confirmed), headline, short
    intro, and CTA buttons
-   Right: uploaded portrait from `static/images/image.png`
-   Headline example: **Building intelligent solutions with code and
    curiosity.**
-   CTA buttons: **Explore Projects**, **Contact Me**, and optionally
    **View Resume** if the resume PDF is included in the project
-   Add restrained animated gradient or particle detail in the
    background
-   Use typing animation only if it remains accessible and does not
    delay the main content

### 3. About section

-   Concise professional introduction
-   Highlight AI/ML, full-stack development, data-driven applications,
    and IoT
-   Use a few small feature cards rather than long paragraphs

### 4. Experience section

-   Timeline or stacked cards for the internship and training entries
-   Show dates, organization, role, and verified bullet points

### 5. Projects section

-   Responsive project-card grid
-   Each card includes title, short description, technology tags, and a
    subtle hover interaction
-   Add repository/demo buttons only when valid URLs are supplied
-   Do not fabricate screenshots, metrics, repository links, or results

### 6. Skills section

-   Group skills by category
-   Use readable labels and simple icons where available
-   Do not show arbitrary percentages or claim expert-level proficiency

### 7. Certifications section

-   Clean grid or compact list
-   Include issuer names exactly as listed above

### 8. Contact section

-   Show email, LinkedIn, GitHub, and location
-   Include a clear email CTA using a `mailto:` link
-   A contact form may be included only if Flask handles validation and
    a real submission flow; otherwise, use direct contact links and do
    not pretend a message was sent

### 9. Footer

-   Name, short role label, social links, and current year generated
    dynamically if practical

## Motion and Interaction

Use smooth, restrained effects: - Scroll-triggered fade/slide reveals -
Gentle card lift on hover - Subtle glow on CTA buttons - Smooth anchor
scrolling - Optional low-intensity particle/parallax background -
Respect `prefers-reduced-motion` - Ensure animations never block
navigation or content access

## Accessibility, Performance, and SEO

-   Semantic HTML and correct heading order
-   Visible keyboard focus states and accessible labels
-   Good color contrast and meaningful image alt text
-   Responsive images and optimized assets
-   Avoid heavy dependencies and unnecessary animation libraries
-   Add page title, meta description, Open Graph metadata, favicon
    placeholder, and descriptive section IDs
-   Use Flask routes and Jinja templates cleanly
-   Keep secrets out of source code and use environment variables for
    configuration
-   Validate and sanitize any form input on the server

## Suggested Flask Project Structure

``` text
harsh-portfolio/
├── app.py
├── requirements.txt
├── README.md
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   ├── images/
│   │   └── image.png
│   └── files/
│       └── resume.pdf        # optional, add only if desired
└── templates/
    ├── base.html
    └── index.html
```

## Definition of Done

-   Website runs locally using Flask with clear setup instructions in
    `README.md`
-   Portrait loads from `static/images/image.png`
-   Every section works on mobile and desktop
-   Navigation, email, LinkedIn, and GitHub links work
-   No placeholder claims, fake statistics, or fabricated project links
-   No console errors or broken assets
-   Visual style feels cohesive, premium, and futuristic
-   The page remains usable with reduced motion and keyboard navigation

## Final Instruction

Deliver the **complete working source code**, not just a mockup: Flask
app, HTML templates, CSS, JavaScript, requirements, and README. Keep all
factual content grounded in the supplied CV/resume. If a detail or URL
is missing, omit it or mark it clearly for the owner to fill in.
