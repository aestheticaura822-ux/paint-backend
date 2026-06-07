// backend/src/controllers/contactController.js
import { supabase } from '../config/supabase.js';

// @desc    Get all messages (Admin only)
// @route   GET /api/contacts
export const getMessages = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create message
// @route   POST /api/contacts
export const createMessage = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .insert([{
        ...req.body,
        status: 'unread',
        created_at: new Date()
      }])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark message as read (Admin only)
// @route   PUT /api/contacts/:id/read
export const markAsRead = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .update({ status: 'read' })
      .eq('id', req.params.id)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete message (Admin only)
// @route   DELETE /api/contacts/:id
export const deleteMessage = async (req, res) => {
  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};