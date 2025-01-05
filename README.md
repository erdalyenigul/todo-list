
# Erdal's ToDo List 🚀

A simple and efficient task management app built with **Vue 3** and **Tailwind CSS**.  
Manage your daily tasks, track progress, and boost productivity.  

---

## ✨ Features
- 📝 **Task Management** – Add, edit, complete, and delete tasks easily.  
- 🎨 **Modern UI** – Clean and responsive design with Tailwind CSS.  
- 🗂️ **Task Filtering** – Filter tasks by completion status.  
- 💾 **LocalStorage** – Save and persist tasks without a backend.  
- ✅ **Completion Toggle** – Mark tasks as complete/incomplete directly from the task list.  

---

## 📸 Screenshots
### Home Page (Landing)
![Landing Screenshot](./public/images/landing.jpg)

### Tasks Page
![Tasks Screenshot](./public/images/tasks.jpg)

---

## 🚀 Live Demo
Check out the live demo: [Erdal's ToDo List](https://your-live-demo-link.com)  

---

## 🛠️ Installation
Follow these steps to run the project locally:  

\`\`\`bash
# Clone the repository
git clone https://github.com/erdal-todo-list.git

# Navigate to the project directory
cd erdal-todo-list

# Install dependencies
npm install

# Start the development server
npm run dev
\`\`\`
Project will be live at: \`http://localhost:5173\`  

---

## 📂 Project Structure
\`\`\`bash
src/
│
├── assets/                # Static assets (images, icons)
├── components/            # Reusable Vue components
├── views/                 # Page views (HomeView, TaskView)
├── router/                # Vue Router configuration
├── utils/                 # Utility functions (localStorage helpers)
└── App.vue                # Main app component
\`\`\`

---

## ⚙️ Built With
- **Vue 3** – Frontend JavaScript Framework  
- **Vite** – Build Tool  
- **Tailwind CSS** – CSS Framework  
- **Pinia** – State Management  
- **Vue Router** – Routing System  

---

## 📌 Roadmap
- [x] Basic task management (add, edit, delete)  
- [x] Task completion and filtering  
- [ ] Task categories (Work, Personal, etc.)  
- [ ] Calendar integration  
- [ ] Notifications and reminders  

---

## 🤝 Contributing
Contributions are welcome!  
If you have ideas, feel free to fork the repo and submit a pull request.  

\`\`\`bash
# Create a new branch
git checkout -b feature/new-feature

# Commit changes
git commit -m "Add new feature"

# Push the branch
git push origin feature/new-feature
\`\`\`

---

## 📄 License
This project is licensed under the **MIT License**.  

---

## 🙋‍♂️ Contact
- **Author:** Erdal Yenigül  
- **LinkedIn:** [Erdal Yenigül](https://www.linkedin.com/in/erdal-yenigul/)  
- **GitHub:** [erdal-dev](https://github.com/erdal-dev)  
"""

file_path = '/mnt/data/README.md'
with open(file_path, 'w') as f:
    f.write(readme_content)

file_path
