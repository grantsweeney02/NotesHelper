import { useState, useContext } from "react"
import axios from "axios"
import AddIcon from "@mui/icons-material/Add"
import CloseIcon from "@mui/icons-material/Close"
import CheckIcon from "@mui/icons-material/Check"
import DeleteIcon from "@mui/icons-material/Delete"
import "../styles/ClassAccordion.css"
import { UserContext } from "../App"
import { useNavigate } from "react-router-dom"

const ClassAccordion = ({ classData, activeAssignment, handleAssignmentChange, showDeleteModal, setShowDeleteModal, setDeletingClass }) => {
	const [isAddingAssignment, setIsAddingAssignment] = useState(false)
	const [newAssignmentName, setNewAssignmentName] = useState("")
	const userData = useContext(UserContext).userData
	const setUserData = useContext(UserContext).setUserData
	const navigate = useNavigate()

	const handleAddAssignment = () => {
		setIsAddingAssignment(true)
	}

	const handleCancelAddAssignment = () => {
		setIsAddingAssignment(false)
		setNewAssignmentName("")
	}

	const handleConfirmAddAssignment = () => {
		axios
			.post("http://localhost:8000/assignments/createAssignment", {
				uid: userData.uid,
				classId: classData.id,
				name: newAssignmentName,
			})
			.then(async (response) => {
				const request = {
					uid: userData.uid,
					email: userData.email,
					displayName: userData.displayName,
				}
				try {
					const response = await axios.post("http://localhost:8000/users/retrieveUserData", request)
					setUserData(response.data)
				} catch (error) {
					console.error("Error retrieving user data: ", error)
				}
			})
			.catch((error) => {
				console.error("Error adding assignment:", error)
			})
		setIsAddingAssignment(false)
		setNewAssignmentName("")
	}

	const handleShowDeleteModal = () => {
		setDeletingClass(classData)
		setShowDeleteModal(true)
	}

	const AssignmentButtons = classData.assignments.map((assignmentData) => {
		return (
			<button
				key={assignmentData.id}
				type="button"
				className={"btn assignment-button" + (activeAssignment.id == assignmentData.id ? " active" : "")}
				onClick={() => handleAssignmentChange(classData.id, assignmentData)}
			>
				{assignmentData.name}
			</button>
		)
	})

	return (
		<>
			<div key={classData.id} className="accordion-item">
				<h2 className="accordion-header">
					<button
						className="accordion-button collapsed"
						type="button"
						data-bs-toggle="collapse"
						data-bs-target={"#collapse-" + classData.id}
						aria-expanded="false"
						aria-controls={"collapse-" + classData.id}
					>
						{classData.name}
					</button>
				</h2>
				<div id={"collapse-" + classData.id} className="accordion-collapse collapse" data-bs-parent="#classesAccordion">
					<div className="accordion-body">
						<div className="btn-group-vertical assignment-buttons" role="group" aria-label={classData.name + " Assignment Buttons"}>
							{AssignmentButtons}
						</div>
						{isAddingAssignment ? (
							<div className="add-assignment-input">
								<input
									type="text"
									className="form-control"
									placeholder="Enter assignment name"
									value={newAssignmentName}
									onChange={(e) => setNewAssignmentName(e.target.value)}
								/>
								<div className="add-assignment-confirms">
									<button type="button" className="btn success-btn" onClick={() => handleConfirmAddAssignment()}>
										<CheckIcon />
									</button>
									<button type="button" className="btn danger-btn" onClick={() => handleCancelAddAssignment()}>
										<CloseIcon />
									</button>
								</div>
							</div>
						) : (
							<button className="btn add-assignment-button" onClick={() => handleAddAssignment()}>
								<AddIcon style={{ marginInline: "0.125rem" }} />
								Add Assignment
							</button>
						)}
						<button className="btn delete-class-button" onClick={() => handleShowDeleteModal()}>
							<DeleteIcon />
							Delete Class
						</button>
					</div>
				</div>
			</div>
		</>
	)
}

export default ClassAccordion
