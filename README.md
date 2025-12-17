# Laptopi Plus

### Personal Web Application Project

---

## Overview

**Laptopi Plus** is a personal web application built to simulate a real-world laptop sales platform, with emphasis on practical e-commerce constraints rather than demo-only features. The project focuses on clean UI, responsive behavior, and realistic business logic such as conditional pricing and update tracking.

---

## Key Goals

* Build a realistic product presentation website, not a mock demo
* Handle edge cases common in sales platforms (e.g. *price on request*)
* Implement clean mobile vs desktop layouts without hacks
* Keep logic understandable and maintainable

---

## Core Features

* Product detail pages with dynamic data rendering
* Conditional price display logic (numeric price vs *price on request*)
* Price update history (updates shown **only when data actually changes**)
* Admin-style dashboard for managing product data
* Fully responsive layout with different content order for mobile and desktop

---

## Technical Stack

* **HTML5** – semantic structure
* **Tailwind CSS** – utility-first styling and responsive design
* **Vanilla JavaScript** – state handling and UI logic
* **Local data storage / JSON** – product data simulation

*(Project intentionally avoids heavy frameworks to demonstrate core fundamentals.)*

---

## Engineering Challenges Solved

* Prevented false-positive updates when product price remains unchanged
* Implemented clean separation between UI rendering and business logic
* Solved mobile/desktop layout order without duplicating logic
* Ensured UI consistency when switching between pricing states

---

## Architecture Summary

* Data-driven rendering (UI reacts to product state)
* Single source of truth for product pricing
* Explicit logic for display rules (no magic values)
* Modular JS functions for easier extension

---

## Project Status

**Active personal project** – continuously improved and extended with new features and refinements.

Planned additions:

* Authentication for admin panel
* Product filtering and search
* Export/import of product data

---

## Links

* **Source code:** https://github.com/Sodge18/laptopiplus
* **Live site:** https://laptopiplus.pages.dev/

---

## Author

**Sergej**
Software / Web Engineer
Personal project focused on clean logic, real-world constraints, and maintainable frontend architecture.

---
