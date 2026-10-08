const db = require('../config/db');
const { validUserId } = require('../utils/ids');

const ALLOWED = ['PROTEIN','CARBOHYDRATES','FAT','TRANS_FAT','SATURATED_FAT','POLYUNSATURATED_FAT','MONOUNSATURATED_FAT','CALORIES','STEPS','EXERCISE','WEIGHT'];
const DEFAULTS = { PROTEIN: 50, CARBOHYDRATES: 275, FAT: 78, TRANS_FAT: 2, SATURATED_FAT: 20, POLYUNSATURATED_FAT: 22, MONOUNSATURATED_FAT: 22, CALORIES: 1500, STEPS: 10000, EXERCISE: 400, WEIGHT: 70 };

async function getUserId(req,res,next){
  try{
    const userId=validUserId(req.params.userId);
    if(!userId) return res.status(400).json({error:'Invalid user id'});
    const [rows]=await db.execute('SELECT nutrient, target_value, is_active, created_at FROM user_nutrient_goals WHERE user_id=? AND is_active=1 ORDER BY nutrient',[userId]);
    res.json({ goals: rows });
  }catch(e){ next(e); }
}

async function postUserId(req,res,next){
  try{
    const userId=validUserId(req.params.userId);
    if(!userId) return res.status(400).json({error:'Invalid user id'});
    let { nutrient, target_value } = req.body||{};
    nutrient=String(nutrient||'').trim().toUpperCase();
    if(!ALLOWED.includes(nutrient)) return res.status(400).json({error:`nutrient must be one of: ${ALLOWED.join(', ')}`});
    let target = target_value==null||target_value==='' ? null : Number(target_value);
    if(target==null) target = DEFAULTS[nutrient] ?? null;
    if(target!=null && (!Number.isFinite(target)||target<0||target>10000)) return res.status(400).json({error:'target_value must be 0-10000'});
    await db.execute(
      `INSERT INTO user_nutrient_goals (user_id, nutrient, target_value, is_active) VALUES (?,?,?,1)
       ON DUPLICATE KEY UPDATE target_value=VALUES(target_value), is_active=1, updated_at=NOW()`,
      [userId, nutrient, target]
    );
    const [rows]=await db.execute('SELECT nutrient, target_value, is_active FROM user_nutrient_goals WHERE user_id=? AND is_active=1 ORDER BY nutrient',[userId]);
    res.status(201).json({ success:true, goals: rows });
  }catch(e){ next(e); }
}

async function deleteUserIdNutrient(req,res,next){
  try{
    const userId=validUserId(req.params.userId);
    const nutrient=String(req.params.nutrient||'').trim().toUpperCase();
    if(!userId) return res.status(400).json({error:'Invalid user id'});
    if(!ALLOWED.includes(nutrient)) return res.status(400).json({error:'Invalid nutrient'});
    await db.execute('UPDATE user_nutrient_goals SET is_active=0 WHERE user_id=? AND nutrient=?',[userId, nutrient]);
    const [rows]=await db.execute('SELECT nutrient, target_value, is_active FROM user_nutrient_goals WHERE user_id=? AND is_active=1 ORDER BY nutrient',[userId]);
    res.json({ success:true, goals: rows });
  }catch(e){ next(e); }
}

module.exports={ getUserId, postUserId, deleteUserIdNutrient, ALLOWED };
