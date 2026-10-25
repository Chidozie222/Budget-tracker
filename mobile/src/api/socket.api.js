import { io } from "socket.io-client";

export const SOCKET_URL = "http://127.0.0.1:4000";

export const connectBudgetSocket = (budgetId, onTransactionCreated) => {
  if (!budgetId || typeof onTransactionCreated !== "function") {
    return null;
  }

  const socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    socket.emit("join-budget", String(budgetId));
  });

  socket.on("transaction:created", (payload) => {
    const eventBudgetId = payload?.budgetId ?? payload?.transaction?.budget_id;

    if (String(eventBudgetId) === String(budgetId)) {
      onTransactionCreated(payload);
    }
  });

  return socket;
};
