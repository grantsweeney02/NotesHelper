const admin = require("firebase-admin");
const db = admin.firestore();

exports.createClass = async (req, res) => {
    const { uid, className } = req.body;

    try {
        const classRef = db
            .collection("users")
            .doc(uid)
            .collection("classes")
            .doc(); // Create a reference for a new document
        await classRef.set({
            name: className,
        });

        const assignmentRef = classRef.collection("assignments").doc();
        await assignmentRef.set({
            name: "Introduction Assignment",
            usedUrls: ["https://example.com/getting-started"],
            recUrls: [
                "https://example.com/features-overview",
                "https://example.com/best-practices",
            ],
        });

        const noteRef = assignmentRef.collection("notes").doc();
        await noteRef.set({
            name: "Getting Started",
            url: "www.getting-started.com",
            summary:
                "Welcome to our app! Here's how to get the most out of it:",
            keyValuePairs: {
                "Create Class":
                    "Start by creating a new class for your subjects or projects.",
                "Add Assignment":
                    "Add assignments to your class and track your progress.",
                "Take Notes":
                    "Keep detailed notes for each assignment. You can include key terms, summaries, and URLs for reference.",
            },
        });

        res.status(201).json({
            message:
                "Class with default assignment and note created successfully",
            classId: classRef.id,
        });
    } catch (error) {
        console.error(
            "Error creating class with default assignment and note:",
            error
        );
        res.status(500).send("Internal Server Error");
    }
};

exports.getClass = async (req, res) => {
    const { uid, classId } = req.body;
    try {
        const classRef = db
            .collection("users")
            .doc(uid)
            .collection("classes")
            .doc(classId);
        const classDoc = await classRef.get();

        if (!classDoc.exists) {
            return res.status(404).send("Class not found");
        }

        const assignmentsSnapshot = await classRef
            .collection("assignments")
            .get();
        const assignments = assignmentsSnapshot.docs.map((doc) => ({
            assignmentId: doc.id,
            ...doc.data(),
        }));
        const classData = {
            classId: classDoc.id,
            ...classDoc.data(),
            assignments,
        };

        res.status(200).json(classData);
    } catch (error) {
        console.error("Error retrieving class:", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.updateClass = async (req, res) => {
    const { uid, classId, className } = req.body;

    try {
        const classRef = db
            .collection("users")
            .doc(uid)
            .collection("classes")
            .doc(classId);

        await classRef.update({
            name: className,
        });

        res.status(200).json({ message: "Class updated successfully" });
    } catch (error) {
        console.error("Error updating class:", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.deleteClass = async (req, res) => {
    const { uid, classId } = req.body;

    try {
        const classRef = db
            .collection("users")
            .doc(uid)
            .collection("classes")
            .doc(classId);

        // Delete all assignments within the class, including their notes
        const assignmentsSnapshot = await classRef
            .collection("assignments")
            .get();
        const deletePromises = assignmentsSnapshot.docs.map(
            async (assignmentDoc) => {
                // Delete notes for each assignment
                const notesSnapshot = await assignmentDoc.ref
                    .collection("notes")
                    .get();
                const deleteNotesPromises = notesSnapshot.docs.map((noteDoc) =>
                    noteDoc.ref.delete()
                );
                await Promise.all(deleteNotesPromises);

                // After all notes are deleted, delete the assignment itself
                return assignmentDoc.ref.delete();
            }
        );

        // Wait for all assignments and their notes to be deleted
        await Promise.all(deletePromises);

        // Finally, delete the class document itself
        await classRef.delete();

        res.status(200).send(
            "Class and all related assignments and notes have been deleted successfully."
        );
    } catch (error) {
        console.error("Error deleting class and its content:", error);
        res.status(500).send("Internal Server Error");
    }
};
