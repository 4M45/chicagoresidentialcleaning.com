/* -------------------------------------------------------------
   Chicago Residential Cleaning - Main JS Interactions
------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  
  // 1. Mobile Menu Drawer Navigation
  const menuToggle = document.getElementById("menuToggle");
  const mobileDrawer = document.getElementById("mobileDrawer");
  const drawerClose = document.getElementById("drawerClose");
  const drawerOverlay = document.getElementById("drawerOverlay");
  const drawerLinks = document.querySelectorAll(".mobile-links a");

  function openDrawer() {
    menuToggle.classList.add("active");
    mobileDrawer.classList.add("active");
    drawerOverlay.classList.add("active");
    menuToggle.setAttribute("aria-expanded", "true");
    mobileDrawer.setAttribute("aria-hidden", "false");
  }

  function closeDrawer() {
    menuToggle.classList.remove("active");
    mobileDrawer.classList.remove("active");
    drawerOverlay.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    mobileDrawer.setAttribute("aria-hidden", "true");
  }

  menuToggle.addEventListener("click", () => {
    const isActive = mobileDrawer.classList.contains("active");
    if (isActive) closeDrawer();
    else openDrawer();
  });

  drawerClose.addEventListener("click", closeDrawer);
  drawerOverlay.addEventListener("click", closeDrawer);
  drawerLinks.forEach(link => link.addEventListener("click", closeDrawer));


  // 2. Sticky Navbar Scroll Trigger
  const header = document.getElementById("header");
  
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });


  // 3. Testimonial Carousel Interaction
  const testimonials = document.querySelectorAll(".testimonial-card");
  const dots = document.querySelectorAll(".carousel-dots .dot");
  const prevBtn = document.getElementById("prevReview");
  const nextBtn = document.getElementById("nextReview");
  let currentReview = 0;

  function showReview(index) {
    // Wrap around boundaries
    if (index >= testimonials.length) currentReview = 0;
    else if (index < 0) currentReview = testimonials.length - 1;
    else currentReview = index;

    // Reset classes
    testimonials.forEach(card => card.classList.remove("active"));
    dots.forEach(dot => dot.classList.remove("active"));

    // Activate current
    testimonials[currentReview].classList.add("active");
    dots[currentReview].classList.add("active");
  }

  nextBtn.addEventListener("click", () => {
    showReview(currentReview + 1);
  });

  prevBtn.addEventListener("click", () => {
    showReview(currentReview - 1);
  });

  dots.forEach(dot => {
    dot.addEventListener("click", (e) => {
      const idx = parseInt(e.target.getAttribute("data-index"));
      showReview(idx);
    });
  });

  // Auto-play testimonial carousel every 8 seconds
  let testimonialInterval = setInterval(() => {
    showReview(currentReview + 1);
  }, 8000);

  // Pause autoplay on button hover/click
  const controls = [prevBtn, nextBtn, ...dots];
  controls.forEach(control => {
    control.addEventListener("mouseenter", () => clearInterval(testimonialInterval));
    control.addEventListener("mouseleave", () => {
      clearInterval(testimonialInterval);
      testimonialInterval = setInterval(() => {
        showReview(currentReview + 1);
      }, 8000);
    });
  });


  // 4. Contact/Quote Form Client-Side Validation & AJAX Submission
  const quoteForm = document.getElementById("quoteForm");
  const successModal = document.getElementById("successModal");
  const closeModalBtn = document.getElementById("closeModal");
  
  // Input fields
  const fullName = document.getElementById("fullName");
  const emailAddr = document.getElementById("emailAddr");
  const phoneNum = document.getElementById("phoneNum");

  // Error messages container mapping
  const formGroups = {
    name: { el: fullName, parent: fullName.closest(".form-group") },
    phone: { el: phoneNum, parent: phoneNum.closest(".form-group") },
    email: { el: emailAddr, parent: emailAddr.closest(".form-group") }
  };

  // Helper validation functions
  function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  }

  function validatePhone(phone) {
    // Accept standard formats: (123) 456-7890, 123-456-7890, 1234567890, etc.
    const re = /^\+?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
    return re.test(String(phone));
  }

  function checkInput(fieldKey) {
    const field = formGroups[fieldKey];
    let isValid = true;

    if (!field.el.value || field.el.value.trim() === "") {
      isValid = false;
    } else if (fieldKey === "email" && !validateEmail(field.el.value.trim())) {
      isValid = false;
    } else if (fieldKey === "phone" && !validatePhone(field.el.value.trim())) {
      isValid = false;
    }

    if (isValid) {
      field.parent.classList.remove("error");
      field.parent.classList.add("success");
    } else {
      field.parent.classList.remove("success");
      field.parent.classList.add("error");
    }

    return isValid;
  }

  // Real-time input checking
  Object.keys(formGroups).forEach(key => {
    const inputEl = formGroups[key].el;
    
    inputEl.addEventListener("input", () => {
      if (inputEl.closest(".form-group").classList.contains("error")) {
        checkInput(key);
      }
    });

    inputEl.addEventListener("blur", () => {
      checkInput(key);
    });
  });

  // Form submission handling
  quoteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    let isFormValid = true;
    Object.keys(formGroups).forEach(key => {
      const isFieldValid = checkInput(key);
      if (!isFieldValid) {
        isFormValid = false;
      }
    });

    if (isFormValid) {
      // AJAX submission to Netlify Forms
      const formData = new FormData(quoteForm);
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
      })
      .then(() => {
        quoteForm.reset();
        
        // Clear success visual states
        Object.keys(formGroups).forEach(key => {
          formGroups[key].parent.classList.remove("success");
        });

        // Show success modal
        successModal.classList.add("active");
        successModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden"; // disable background scrolling
      })
      .catch(error => {
        console.error("Netlify form submission failed:", error);
      });
    }
  });

  // Close Success Modal
  closeModalBtn.addEventListener("click", () => {
    successModal.classList.remove("active");
    successModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "visible"; // restore background scrolling
  });

});
