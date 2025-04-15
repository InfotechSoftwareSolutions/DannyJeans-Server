const { Courses } = require("../../models/courseModel");

const createCourse = async (req, res, next) => {
    try {
        console.log("createCourse");
        console.log(req.files);
        console.log(req.body);

        // const { course_name , title, category, description, course_Fee} = req.body;
        const { heading, selectedOption, content, courseFee} = req.body;

        if (!heading || !selectedOption || !content || !courseFee ) {

            const error = {
                status: 400,
                message: "Invalid input data",
                fields: {
                    body: req.body,
                    required: { heading, selectedOption, content, courseFee }
                },
            };
            return next(error);
        }

        const isExist = await Courses.findOne({ course_name:heading });

        if (isExist) {
            return res.status(422).json({
                message: "This course Already Exist",
            });
        }

        const images = req.files["images"] ? req.files["images"].map((file) => file.path) : [];
        const searchString = "images-";
        const [file_path] = images;
        const searchStringIndex = file_path.indexOf(searchString);

        if (searchStringIndex === -1) {
            //check it
            return req.file.path;
        }
        const result = file_path.slice(searchStringIndex + searchString.length);

        let isCreate = await Courses.create({
            course_name: heading,
            category: selectedOption,
            description: content,
            course_Fee: courseFee,
            status: false,
            image: result
        });

        if (!isCreate) {

            const error = {
                status: 500,
                message: "Account creation failed",
            };
            return next(error);
        }

        let Course = await Courses.find();

        if (!Course) {
            const error = {
                status: 404,
                message: "No courses found",
            };
            return next(error);
        }

        res.status(201).json({
            Course,
            message: "Course has been created successfully",
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "An unexpected error occurred", error: error.message });
    }
};

const updateCourse = async (courseData) => {
    try {
        // const { name, phonenumber, password } = req.body;

        // if (!name || !phonenumber || !password) {
        //     return res.status(400).json({
        //         message: "Invalid input data",
        //     });
        // }

        let updatedContent = null;
        const images = req.files["images"] || [];
        const pdfs = req.files["pdfs"] || [];
        const videos = req.files["videos"] || [];

        // Process images, PDFs, and videos as needed
        const imagePaths = images.map((file) => file.path);
        const pdfPaths = pdfs.map((file) => file.path);
        const videoPaths = videos.map((file) => file.path);

        if (req.body.contentType === "image" && imagePaths.length > 0) {
            const searchString = "images-";
            const [file_path] = imagePaths;
            const searchStringIndex = file_path.indexOf(searchString);

            if (searchStringIndex === -1) {
                return req.file.path;
            }

            const update = {
                description: req.body.description,
                contentType: req.body.contentType,
                images: {
                    image: result,
                    caption: req.body.caption,
                },
            };
            // Options
            const options = { new: true, runValidators: true };

            updatedContent = await Content.findByIdAndUpdate(req.params.id, update, options);

            if (!updatedContent) {
                // If no document was found and updated
                return res.status(404).json({
                    message: "Content not found or update failed",
                });
            }

            // If the update was successful
            return res.status(200).json({
                message: "Content updated successfully",
                content: updatedContent,
            });
        }
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "An unexpected error occurred", error: error.message });
    }
};

module.exports = {
    createCourse,
};
