import "./App.css"
import { useState } from "react"
import axios from "axios"

function App() {

  const [isSignup, setIsSignup] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("member")

  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [dueDate, setDueDate] = useState("")

  const [projectTitle, setProjectTitle] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [members, setMembers] = useState("")

  const API = "https://taskmanagement-production-b151.up.railway.app"

  const handleSignup = async () => {

    try {

      await axios.post(`${API}/signup`, {
        name,
        email,
        password,
        role
      })

      alert("Signup successful!")

      setIsSignup(false)

    } catch (error) {

      alert("Signup failed")
    }
  }

  const handleLogin = async () => {

    try {

      const response = await axios.post(`${API}/login`, {
        name: "",
        email,
        password,
        role
      })

      localStorage.setItem(
        "token",
        response.data.token
      )

      localStorage.setItem(
        "role",
        role
      )

      setIsLoggedIn(true)

      await fetchTasks()
      await fetchProjects()
      await fetchStats()

    } catch (error) {

      alert("Login failed")
    }
  }

  const fetchTasks = async () => {

    try {

      const token = localStorage.getItem("token")

      const response = await axios.get(
        `${API}/tasks`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setTasks(response.data || [])

    } catch (error) {

      console.log(error)
    }
  }

  const fetchProjects = async () => {

    try {

      const token = localStorage.getItem("token")

      const response = await axios.get(
        `${API}/projects`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setProjects(response.data || [])

    } catch (error) {

      console.log(error)
    }
  }

  const fetchStats = async () => {

    try {

      const token = localStorage.getItem("token")

      const response = await axios.get(
        `${API}/dashboard/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setStats(response.data)

    } catch (error) {

      console.log(error)
    }
  }

  const createProject = async () => {

    try {

      const token = localStorage.getItem("token")

      await axios.post(
        `${API}/projects`,
        {
          title: projectTitle,
          description: projectDescription,
          members: members.split(",")
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      alert("Project created!")

      fetchProjects()

      setProjectTitle("")
      setProjectDescription("")
      setMembers("")

    } catch (error) {

      alert("Project creation failed")
    }
  }

  const createTask = async () => {

    try {

      const token = localStorage.getItem("token")

      await axios.post(
        `${API}/tasks`,
        {
          title,
          description,
          assigned_to: assignedTo,
          status: "pending",
          due_date: dueDate
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      alert("Task created!")

      fetchTasks()
      fetchStats()

      setTitle("")
      setDescription("")
      setAssignedTo("")
      setDueDate("")

    } catch (error) {

      alert("Task creation failed")
    }
  }

  const markCompleted = async (taskTitle) => {

    try {

      const token = localStorage.getItem("token")

      await axios.put(
        `${API}/tasks/${taskTitle}?status=completed`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      fetchTasks()
      fetchStats()

    } catch (error) {

      console.log(error)
    }
  }

  if (isLoggedIn) {

    return (

      <div className="container">

        <div className="dashboard-header">

          <h1>Dashboard</h1>

          <button
            className="logout-btn"
            onClick={() => {

              localStorage.removeItem("token")

              setIsLoggedIn(false)
            }}
          >
            Logout
          </button>

        </div>

        {stats && (

          <div className="stats-grid">

            <div className="stat-card">
              <h3>Total Tasks</h3>
              <h2>{stats.total_tasks}</h2>
            </div>

            <div className="stat-card">
              <h3>Completed</h3>
              <h2>{stats.completed_tasks}</h2>
            </div>

            <div className="stat-card">
              <h3>Pending</h3>
              <h2>{stats.pending_tasks}</h2>
            </div>

            <div className="stat-card">
              <h3>Overdue</h3>
              <h2>{stats.overdue_tasks}</h2>
            </div>

          </div>
        )}

        {role === "admin" && (

          <>
            <div className="card">

              <h2>Create Project</h2>

              <input
                placeholder="Project title"
                value={projectTitle}
                onChange={(e) =>
                  setProjectTitle(e.target.value)
                }
              />

              <input
                placeholder="Project description"
                value={projectDescription}
                onChange={(e) =>
                  setProjectDescription(e.target.value)
                }
              />

              <input
                placeholder="member1@gmail.com,member2@gmail.com"
                value={members}
                onChange={(e) =>
                  setMembers(e.target.value)
                }
              />

              <button onClick={createProject}>
                Create Project
              </button>

            </div>

            <div className="card">

              <h2>Create Task</h2>

              <input
                placeholder="Task title"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
              />

              <input
                placeholder="Task description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
              />

              <input
                placeholder="Assign email"
                value={assignedTo}
                onChange={(e) =>
                  setAssignedTo(e.target.value)
                }
              />

              <input
                type="date"
                value={dueDate}
                onChange={(e) =>
                  setDueDate(e.target.value)
                }
              />

              <button onClick={createTask}>
                Create Task
              </button>

            </div>
          </>
        )}

        <h2 className="section-title">
          Projects
        </h2>

        {projects?.map((project, index) => (

          <div
            key={index}
            className="project-card"
          >

            <h3>{project.title}</h3>

            <p>{project.description}</p>

            <b>Members:</b>

            <ul>

              {project.members?.map((member, idx) => (

                <li key={idx}>
                  {member}
                </li>

              ))}

            </ul>

          </div>
        ))}

        <h2 className="section-title">
          Tasks
        </h2>

        {tasks?.map((task, index) => (

          <div
            key={index}
            className="task-card"
          >

            <h3>{task.title}</h3>

            <p>{task.description}</p>

            <p>
              Status:
              {" "}
              <span
                className={
                  task.status === "completed"
                    ? "completed"
                    : "pending"
                }
              >
                {task.status}
              </span>
            </p>

            <p>
              Assigned To:
              {" "}
              {task.assigned_to}
            </p>

            <p>
              Due Date:
              {" "}
              {task.due_date}
            </p>

            {role === "admin" &&
              task.status !== "completed" && (

              <button
                onClick={() =>
                  markCompleted(task.title)
                }
              >
                Mark Completed
              </button>
            )}

          </div>
        ))}

      </div>
    )
  }

  return (

    <div className="auth-container">

      <h1>Team Task Manager</h1>

      {isSignup && (

        <input
          placeholder="Name"
          onChange={(e) =>
            setName(e.target.value)
          }
        />
      )}

      <input
        placeholder="Email"
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <select
        onChange={(e) =>
          setRole(e.target.value)
        }
      >

        <option value="member">
          Member
        </option>

        <option value="admin">
          Admin
        </option>

      </select>

      {isSignup ? (

        <button onClick={handleSignup}>
          Signup
        </button>

      ) : (

        <button onClick={handleLogin}>
          Login
        </button>

      )}

      <br /><br />

      <button
        className="link-btn"
        onClick={() =>
          setIsSignup(!isSignup)
        }
      >

        {isSignup
          ? "Already have account? Login"
          : "New user? Signup"}

      </button>

    </div>
  )
}

export default App