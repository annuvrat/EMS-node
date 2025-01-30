const router = express.Router();
import Employee from    "../models/Employee";
const bcrypt = require('bcrypt');
import generateTokens from "../../utils/generateTokens.js";
import {signUpBodyValidation} from '../utils/validaton.js'
const Router = Router();

router.post("/signup",async(req,res)=>{
    try {
        const {error} = signUpBodyValidation(req.body);
        if(error)return res.status(400).json({error:true,message:error.details[0].message});

        const user = await Employee.findOne({email:req.body.email});
        if(user)return res.status(400).json({error:true,message:"Email already exists"});
        
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashpassword = await bcrypt.hash(req.body.password,salt);

        await new Employee({...req.body,password:hashPassword}).save();

        res.status(201).json({error:false,message:"Account created succesfully"});

} catch (err) {
        console.log(err);
        res.status(500).json({error:true,message:"internal sever error"});
   
        
    }
});

router.post('/login',async(req,res)=>{
    try {
        const {error} = loginbodyvalidation(req.body);
        if(error)return res.status(400).json({error:true,message:error.details[0].message});

        const user = await UserActivation.findOne({email:req.body.email});
        if(!user)return res.status(401).json({error:true,message:"Email not found"});

      

            const verifiedPassword = await bcrypt.compare(req.body.password,user.password);
            if(!verifiedPassword)return res.status(401).json({error:true,message:"Invalid password"});

            const{accessToken,refreshToken}= await generateTokens(user);

            res.status(200).json({
                error:false,
                accessToken,
                refreshToken,
                message:"logged in successfully",
            });
    } 
    catch (error) {
        console.log(err);
        res.status(500).json({error:true,message:"internal Server Error"});
        
    }
});

export default router;


