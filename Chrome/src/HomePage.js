import React from "react";
import { useState } from "react";

const HomePage = ({
    classes,
    activeClassId,
    setActiveClassId,
    activeAssignmentId,
    setActiveAssignmentId,
    notesForAssignment,
    uid,
}) => {
    const [newNoteGenerated, setNewNoteGenerated] = useState(false);
    const [newNote, setNewNote] = useState({});

    const handleNoteClick = (classId, assignmentId, noteId) => {
        chrome.tabs.create({
            url: `http://localhost:5173/${classId}-${assignmentId}/${noteId}`,
        });
    };

    const handleGenerateNotes = async () => {
        console.log(
            "Generating notes for assignment with id: ",
            activeAssignmentId
        );
        let html = document.documentElement.outerHTML;
        let cleanHTML = removeTagsFromDocument(html);
        const response = await fetch("http://localhost:8000/services/scan", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: cleanHTML,
            }),
        });
        setNewNoteGenerated(true);
        const newRequest = await response.json();
        const response2 = await fetch(
            "http://localhost:8000/notes/createNote",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newRequest.name,
                    summary: newRequest.summary,
                    keyValuePairs: newRequest.keyValuePairs,
                    classId: activeClassId,
                    assignmentId: activeAssignmentId,
                    uid: uid,
                    url: window.location.href,
                }),
            }
        );
        setNewNote(await response.json());
    };

    return (
        <div>
            <h1> Home Page</h1>
            {/* dropdown to select class from */}
            <select
                onChange={(e) => {
                    setActiveClassId(e.target.value);
                    setActiveAssignmentId(null);
                }}
                className="form-select"
            >
                <option value="">Select Class</option>
                {classes.map((classObj) => (
                    <option key={classObj.id} value={classObj.id}>
                        {classObj.name}
                    </option>
                ))}
            </select>
            {/* dropdown to select assignment from only once a class is selected*/}
            {activeClassId && (
                <select
                    onChange={(e) => setActiveAssignmentId(e.target.value)}
                    className="form-select"
                >
                    <option value="">Select Assignment</option>
                    {classes
                        .find((classObj) => classObj.id === activeClassId)
                        .assignments.map((assignment) => (
                            <option key={assignment.id} value={assignment.id}>
                                {assignment.name}
                            </option>
                        ))}
                </select>
            )}
            {activeAssignmentId && newNote && (
                <div>
                    <button
                        className="btn btn-primary"
                        onClick={() => handleGenerateNotes()}
                    >
                        Generate Notes
                    </button>
                    {newNoteGenerated && (
                        <div>
                            <h2>Generated Note</h2>
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">
                                        {newNote.name}
                                    </h5>
                                    <p className="card-text">
                                        {newNote.summary}
                                    </p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() =>
                                            handleNoteClick(
                                                activeClassId,
                                                activeAssignmentId,
                                                newNote.noteId
                                            )
                                        }
                                    >
                                        View in Dashboard
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    <h2>Notes</h2>
                    {notesForAssignment.map((note) => (
                        <div key={note.noteId} className="card">
                            <div className="card-body">
                                <h5 className="card-title">{note.name}</h5>
                                <p className="card-text">{note.summary}</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() =>
                                        handleNoteClick(
                                            activeClassId,
                                            activeAssignmentId,
                                            note.noteId
                                        )
                                    }
                                >
                                    View in Dashboard
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HomePage;
