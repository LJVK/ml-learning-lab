import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>ML Learning Lab</h1>
        <p>From attention to generative AI</p>
      </div>

      <nav className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/concepts">Concepts</NavLink>
        <NavLink to="/code">Code</NavLink>
        <NavLink to="/questions">Questions</NavLink>
        <NavLink to="/roadmap">Roadmap</NavLink>
        <NavLink to="/resources">Resources</NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;