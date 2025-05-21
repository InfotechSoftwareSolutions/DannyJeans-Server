const { User } = require("../../models/userModel");
const { generatePasswordHash, comparePasswordHash } = require("../../utils/bcrypt");
const { generateAccessToken } = require("../../utils/jwt");

const signup = async (req, res, next) => {
    try {

        const { name, email, phone, password,role , status} = req.body;

        if (!name || !phone || !password || !email || !role || !status) {
            const error = {
                status: 400,
                message: "Invalid input data",
                fields: {
                    body: req.body,
                    required: { name, email, phone, password,role , status }
                },
            };
            return next(error);
        }

        const isExist = await User.findOne({ phone });

        if (isExist) {
            return res.status(422).json({
                message: "User Already Exist",
            });
        }

        const hashedPassword = await generatePasswordHash(password);

        const isCreate = await User.create({
            name,
            email,
            phone,
            role : "user",
            password: hashedPassword,
            status: true
        });

        if (!isCreate) {

            const error = {
                status: 500,
                message: "Account creation failed",
            };
            return next(error);
        }

        res.status(201).json({
            message: "Account has been created successfully",
        });

    } catch (error) {
        console.error("Error creating user:", error);
        next(error)
    }
};

const login = async (req, res,next) => {
    
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            const error = {
                status: 400,
                message: "Invalid input data",
                fields: {
                    body: req.body,
                    required: {phone, password }
                },
            };
            return next(error);
        }

        const user = await User.findOne({ email ,  isActive: true });
        console.log(user);
        
        if (!user) {
            const error = {
                status: 401,
                message: "User does not exist",
            };
            return next(error);
        }

        const validPassword = await comparePasswordHash(password, user.password);
        console.log(validPassword);
        if (!validPassword) {
            const error = {
                status: 401,
                message: "Invalid password or Username",
            };
            return next(error);
        }
        
        const accessToken = generateAccessToken(user._id);
        // const refreshToken = generateRefresh
        // 
        
        // Token(user._id);

        // console.log(accessToken,refreshToken);
        
        // res.cookie("refreshToken", refreshToken, {
        //     httpOnly: true,
        //     secure: true,
        // })

        const userData ={
            name:user?.name,
            phone:user?.phone,
            email:user?.email,
            image:user?.image,
            role:user?.role
            }
            res.status(200)
            .json({ success: true, accessToken, userData, message: "login successfull" });

    } catch (error) {
        console.error("Error creating user:", error);
        next(error)
    }
};

module.exports = {
    login,
    signup,
};

// ***********************************************************************

// const { name, email, password, phone, isAdmin, status, role, address } = req.body;

// // Check required fields
// if (!name || !email || !password || !phone) {
//     return res.status(400).json({ message: "Name, email, password, and phone are required." });
// }

// // Validate name
// if (typeof name !== "string" || name.trim().length < 3 || name.trim().length > 50) {
//     return res.status(400).json({ message: "Name must be a string between 3 and 50 characters." });
// }

// // Validate email format
// const emailRegex = /^\S+@\S+\.\S+$/;
// if (typeof email !== "string" || !emailRegex.test(email)) {
//     return res.status(400).json({ message: "Invalid email format." });
// }

// // Validate password
// if (typeof password !== "string" || password.length < 6) {
//     return res.status(400).json({ message: "Password must be at least 6 characters long." });
// }

// // Validate phone number (10-digit numeric string)
// const phoneRegex = /^\d{10}$/;
// if (typeof phone !== "string" || !phoneRegex.test(phone)) {
//     return res.status(400).json({ message: "Phone number must be exactly 10 digits." });
// }

// // Validate isAdmin (optional)
// if (isAdmin !== undefined && typeof isAdmin !== "boolean") {
//     return res.status(400).json({ message: "Invalid type: isAdmin must be a boolean." });
// }

// // Validate status
// if (typeof status !== "boolean") {
//     return res.status(400).json({ message: "Invalid type: status must be a boolean." });
// }

// // Validate role (must be "admin" or "user")
// if (!["admin", "user"].includes(role)) {
//     return res.status(400).json({ message: "Invalid role. Must be 'admin' or 'user'." });
// }

// // Validate address (optional but must be a valid ObjectId if provided)
// if (address !== undefined && !mongoose.Types.ObjectId.isValid(address)) {
//     return res.status(400).json({ message: "Invalid address ID." });
// }

// // Proceed to next middleware or controller logic
// next();


// ***********************************************************************


