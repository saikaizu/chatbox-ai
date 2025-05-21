const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', (req, res) => {
  res.render('chat', { messages: [] });
});

router.post('/', async (req, res) => {
  const userMessage = req.body.message;
  const apiKey = process.env.OPENAI_API_KEY;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mistral-small-3.1-24b-instruct:free',
        messages: [{ role: 'user', content: userMessage }],
        stream: false // ini penting!
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'ChatbotAI'
        }
      }
    );

    let aiMessage = response.data.choices[0].message.content;

    // ✅ Rapikan teks AI (tambahkan spasi yang hilang)
aiMessage = aiMessage
  .replace(/([.,!?])(?=\S)/g, '$1 ')        // spasi setelah .,!? jika tidak ada spasi
  .replace(/([a-zA-Z])([A-Z])/g, '$1 $2')   // camelCase dipisah
  .replace(/([a-z])([A-Z])/g, '$1 $2')      // huruf nempel dipisah
  .replace(/([a-zA-Z])(\d)/g, '$1 $2')      // teks ketemu angka
  .replace(/(\d)([a-zA-Z])/g, '$1 $2')      // angka ketemu teks
  .replace(/([a-z])([A-Z])/g, '$1 $2')      // huruf kecil -> huruf kapital
  .replace(/([a-zA-Z])([a-zA-Z])/g, (match, p1, p2, offset, string) => {
    // Tambahkan spasi jika ada 2 huruf nempel tanpa spasi, hanya jika sebelumnya ada banyak huruf nempel
    const prev = string.slice(Math.max(0, offset - 5), offset);
    return /[a-zA-Z]{3}/.test(prev) ? p1 + ' ' + p2 : match;
  })
  .replace(/\s+/g, ' ')                     // hilangkan spasi dobel
  .trim();                                  // bersihin spasi awal/akhir


    res.render('chat', {
      messages: [
        { from: 'user', text: userMessage },
        { from: 'ai', text: aiMessage }
      ]
    });
  } catch (error) {
    console.error('Chatbot error:', error.response?.data || error.message);
    res.render('chat', {
      messages: [
        { from: 'user', text: userMessage },
        { from: 'ai', text: '❌ Gagal dapet respon dari AI, coba lagi!' }
      ]
    });
  }
});

module.exports = router;
