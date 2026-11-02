# Task 2: To-Do List Web Application (TaskOrbit)

**Internship Track:** Full Stack Development (1 Month)  
**Organization:** CodeOrbit Tech (Batch 3)  
**Intern Name:** Rahul Raj Das  
**Intern ID:** COT/BTH3/91388  

---

## 📌 Project Overview
A clean, responsive, and feature-complete To-Do List web application designed to help users organize, prioritize, and track their daily workflows and internship assignments. 

The application utilizes vanilla JavaScript, HTML5, and CSS3. All tasks and changes are automatically persisted to the browser's `localStorage` so data remains intact across page reloads and browser sessions.

---

## 🚀 Key Features
1. **Full CRUD Operations:**
   - **Create:** Add tasks with title, optional notes/description, priority (High, Medium, Low), category tags (Work, Personal, Study, CodeOrbit), and due dates.
   - **Read:** Clear list view with visual badges and priority color tags.
   - **Update:** Interactive edit modal to modify title, category, priority, or due date at any time.
   - **Delete:** Remove tasks individually or batch-clear all completed tasks.
2. **State & Completion Tracking:**
   - One-click completion checkbox with strike-through styling.
   - Dynamic metrics banner computing Total, Active, Completed tasks, and a percentage progress bar.
3. **Smart Filters & Search:**
   - Filter by status tabs: **All**, **Active**, and **Completed**.
   - Real-time search query filtering through titles, descriptions, and categories.
   - Sorting options: **Newest**, **Oldest**, **Priority**, and **Due Date**.
4. **Data Persistence & Portability:**
   - Auto-syncs with browser `localStorage`.
   - **JSON Export / Import:** Backup tasks to a `.json` file and restore them on any machine.
5. **UI & Accessibility:**
   - Dark / Light mode toggle.
   - Toast notification feedback on all user interactions.
   - Mobile-first responsive layout.

---

## 🛠️ Technologies Used
- **HTML5:** Semantic form inputs, accessible buttons, and modals.
- **CSS3:** Custom properties (CSS variables), Flexbox, CSS Grid, media queries, and transition animations.
- **JavaScript (ES6+):** Array methods (`filter`, `map`, `sort`), DOM manipulation, Event Delegation, `localStorage` API, File Reader API (JSON import/export).

---

## 💻 Setup and Run Instructions
1. Navigate to the Task 2 directory:
   ```bash
   cd Task2_TodoList_WebApp
   ```
2. Open `index.html` in any web browser:
   - Double-click `index.html` in your file explorer, OR
   - Run via a lightweight local server:
     ```bash
     npx serve .
     ```
3. Test all features:
   - Add new tasks with various categories and priorities.
   - Check off completed tasks and observe the progress bar update.
   - Edit a task using the pencil icon.
   - Filter using the search bar and status tabs.
   - Click **Export** to backup your tasks into a JSON file.
