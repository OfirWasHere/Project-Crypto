/// <reference path="jquery-3.6.1.js" />

"use strict";

$(() => {

    // Hamburger menu button
    const menuHamburger = document.querySelector(".menu-hamburger")
    const navLinks = document.querySelector(".nav-links")
    const mainContent = document.querySelector(".mainContent")

    // functionality to the burger button
    menuHamburger.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-menu')
        mainContent.classList.toggle('mobile-menu-main')
    })

});
