const authService = require("../services/auth.service");

const registerUser = async(req, res) => {

    // console.log(req.body);

    const userData = req.body;

    const result = await authService.registerUser(userData);

    res.json(result);

};

const loginUser = async (req, res) => {

    const loginData = req.body;

    const result = await authService.loginUser(loginData);

    res.json(result);

};
//exporting the function
module.exports ={
    registerUser,loginUser
};