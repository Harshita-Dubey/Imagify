import userModel from "../models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import razorpay from 'razorpay';
import transactionModel from "../models/transactionModel.js";
const registerUser = async (req, res) => {
    try {
        const {name,email,password} = req.body;
        if(!name || !email || !password){
            return res.json({success:false,message:'MISSING DETAILS'})
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt)

        const userData = {
            name,
            email,
            password: hashedPassword
        }
        const newUser = new userModel(userData)
        const user = await newUser.save()
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)
        res.json({success:true, token, user:{name:user.name}})
    }
 catch(error){
    console.log(error)
    res.json({success: false, message:error.message})

}
}

const loginUser = async (req,res) => {
    try {
        const {email,password} = req.body;
        const user = await userModel.findOne({email})
        if(!user) {
            return res.json({success:false, message: 'User Does Not Exist'})
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(isMatch){
           const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)
            res.json({success:true, token, user:{name:user.name}})
        } else{
            return res.json({success:false, message: 'Invalid credentials'})
        }
    } catch(error){
        console.log(error)
        res.json({success: false, message:error.message})
    

    }
}
const userCredit = async (req,res) => {
    try {
        const {userId} = req.body
        const user = await userModel.findById(userId);
        res.json({success: true, credits: user.creditBalance,user:{name:user.name}})
    } catch(error) {
        console.log(error.message)
        res.json({success: false, message:error.message})
    
    }
}

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentRazorpay = async (req, res) => {
    try {
      const { userId, planId } = req.body;
  
      if (!userId || !planId) {
        return res.json({ success: false, message: 'Missing userId or planId' });
      }
  
      const userData = await userModel.findById(userId);
      if (!userData) {
        return res.json({ success: false, message: 'User not found' });
      }
  
      // Define your plans
      const planDetails = {
        basic: { plan: 'Basic', credits: 100, amount: 10 },
        pro: { plan: 'Pro', credits: 500, amount: 50 },
        ultimate: { plan: 'Ultimate', credits: 5000, amount: 250 },
      };
  
      // Match plan
      const selectedPlan = planDetails[planId?.toLowerCase()];
      if (!selectedPlan) {
        return res.json({ success: false, message: 'Plan not found' });
      }
  
      const { plan, credits, amount } = selectedPlan;
  
      // Create transaction
      const date = Date.now();
      const transactionData = {
        userId,
        plan,
        amount,
        credits,
        date,
      };
      const newTransaction = await transactionModel.create(transactionData);
  
      // Create Razorpay order
      const options = {
        amount: amount * 100,
        currency: process.env.CURRENCY,
        receipt: newTransaction._id.toString(),
      };
  
      razorpayInstance.orders.create(options, (error, order) => {
        if (error) {
          console.error('Razorpay Error:', error);
          return res.json({ success: false, message: 'Failed to create Razorpay order' });
        }
        res.json({ success: true, order });
      });
  
    } catch (error) {
      console.error('Payment Error:', error.message);
      res.json({ success: false, message: error.message });
    }
  };
  
  import crypto from 'crypto';

  const verifyRazorpay = async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
      // Step 1: Verify signature
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");
  
      if (expectedSignature !== razorpay_signature) {
        return res.json({ success: false, message: "Invalid signature" });
      }
  
      // Step 2: Fetch order to get transaction ID from receipt
      const order = await razorpayInstance.orders.fetch(razorpay_order_id);
  
      const transaction = await transactionModel.findById(order.receipt);
      if (!transaction) {
        return res.json({ success: false, message: "Transaction not found" });
      }
  
      if (transaction.payment) {
        return res.json({ success: false, message: "Already processed" });
      }
  
      const user = await userModel.findById(transaction.userId);
      const updatedCredits = (user.creditBalance || 0) + transaction.credits;
  
      await userModel.findByIdAndUpdate(user._id, { creditBalance: updatedCredits });
      await transactionModel.findByIdAndUpdate(transaction._id, { payment: true });
  
      res.json({ success: true, message: "Credits Added" });
  
    } catch (error) {
      console.error("Verify Razorpay Error:", error.message);
      res.json({ success: false, message: error.message });
    }
  };
  
export {registerUser, loginUser,userCredit,paymentRazorpay,verifyRazorpay}