export default {
  handleActions
};

function handleActions(state, action, handlers) {
  if (!handlers) return state;

  const handler = handlers[action.type];

  if (!handler) return state;

  const newState = {...state};

  handler(newState, action.payload);

  return newState;
}
