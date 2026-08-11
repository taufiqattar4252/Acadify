const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/acadify')
  .then(async () => {
    const MockTest = mongoose.model('MockTest', new mongoose.Schema({ category: String }, { strict: false }));
    const result = await MockTest.updateMany(
      { $or: [{ category: { $exists: false } }, { category: null }] }, 
      { $set: { category: 'Full Mock Test' } }
    );
    console.log(result);
    process.exit(0);
  })
  .catch(err => console.error(err));
