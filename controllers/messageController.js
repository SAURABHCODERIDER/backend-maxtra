const Message = require("../models/Message");


// SAVE MESSAGE
const saveMessage = async (req, res) => {

  try {

    const newMessage = new Message(req.body);

    await newMessage.save();

    res.status(201).json(newMessage);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};


// GET CHAT
const getMessages = async (req, res) => {

  try {

    const { senderId, receiverId } = req.params;

    const messages = await Message.find({

      $or: [

        {
          senderId,
          receiverId,
        },

        {
          senderId: receiverId,
          receiverId: senderId,
        },

      ],

    }).sort({ createdAt: 1 });

    res.json(messages);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

module.exports = {
  saveMessage,
  getMessages,
};