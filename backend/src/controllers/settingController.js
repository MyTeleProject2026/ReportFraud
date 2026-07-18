const { query, queryOne } = require('../config/db');
const { sanitizeInput } = require('../utils/helpers');

const getSettings = async (req, res) => {
  try {
    const settings = await query('SELECT * FROM settings');
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.setting_key] = s.setting_value;
    });
    res.json({
      success: true,
      data: settingsObj
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching settings'
    });
  }
};

const getSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await queryOne('SELECT * FROM settings WHERE setting_key = ?', [key]);
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        [setting.setting_key]: setting.setting_value
      }
    });
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching setting'
    });
  }
};

const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const setting = await queryOne('SELECT * FROM settings WHERE setting_key = ?', [key]);
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }
    
    await query(
      'UPDATE settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?',
      [value !== undefined ? String(value) : '', key]
    );
    
    const updatedSetting = await queryOne('SELECT * FROM settings WHERE setting_key = ?', [key]);
    
    res.json({
      success: true,
      message: 'Setting updated successfully',
      data: {
        [updatedSetting.setting_key]: updatedSetting.setting_value
      }
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating setting'
    });
  }
};

const updateMultipleSettings = async (req, res) => {
  try {
    const settings = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings data'
      });
    }
    
    const keys = Object.keys(settings);
    const updatePromises = keys.map(key => {
      return query(
        'UPDATE settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?',
        [String(settings[key]), key]
      );
    });
    
    await Promise.all(updatePromises);
    
    const updatedSettings = await query('SELECT * FROM settings');
    const settingsObj = {};
    updatedSettings.forEach(s => {
      settingsObj[s.setting_key] = s.setting_value;
    });
    
    res.json({
      success: true,
      message: 'All settings updated successfully',
      data: settingsObj
    });
  } catch (error) {
    console.error('Update multiple settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating settings'
    });
  }
};

module.exports = {
  getSettings,
  getSettingByKey,
  updateSetting,
  updateMultipleSettings
};