const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('joinOrder', (orderId) => {
      socket.join(orderId);
      console.log(`Client joined order room: ${orderId}`);
    });

    socket.on('updateOrderStatus', ({ orderId, status }) => {
      io.to(orderId).emit('orderStatusUpdated', { orderId, status });
      console.log(`Order ${orderId} status updated to ${status}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocket;