export default {
  async up(db, client) {
    // Add the address field to the User schema
    await db.collection('users').updateMany(
      {},
      { $set: { address: '' } } // Default value for existing documents
    );
  },

  async down(db, client) {
    // Remove the address field from the User schema
    await db.collection('users').updateMany({}, { $unset: { address: '' } });
  },
};
