let socketServer = null;

export const initSocket = (httpServer) => {
  // Placeholder for future real-time integration.
  // Keeping a no-op implementation avoids hard dependency on socket libraries.
  socketServer = {
    emit: () => {},
  };
  return socketServer;
};

export const getSocket = () => socketServer;
