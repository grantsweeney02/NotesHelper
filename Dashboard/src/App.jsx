import { BrowserRouter, Route, Routes } from "react-router-dom"
import Dashboard from "./components/Dashboard"
import dummyUser from "../dummyUser.json"
import NoteDetails from "./components/NoteDetails"
import ClassesSidebar from "./components/ClassesSidebar"
import DashboardContent from "./components/DashboardContent"

function App() {
	return (
		<>
			<BrowserRouter>
				<div className="container-fluid">
					<div className="row">
						<ClassesSidebar />
						<Routes>
							<Route path="/" element={<Dashboard data={dummyUser} />} />
							<Route path="/:assignmentID" element={<DashboardContent data={dummyUser} />} />
							<Route path="/:assignmentID/:noteID" element={<NoteDetails />} />
						</Routes>
					</div>
				</div>
			</BrowserRouter>
		</>
	)
}

export default App
