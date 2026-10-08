# Controllers — keep route handlers thin
# Each file should export async (req,res,next) functions and call services.
# Current routes still contain SQL directly (intentional: no logic changed). Move logic here gradually.
# Example:
# // controllers/authController.js
# const authService = require('../services/authService');
# exports.login = async (req,res,next) => { try { const user = await authService.login(req.body); res.json(user);} catch(e){ next(e);} }
