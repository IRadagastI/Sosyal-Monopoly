const browserGlobals = {
  window: "readonly",
  document: "readonly",
  navigator: "readonly",
  console: "readonly",
  confirm: "readonly",
  getComputedStyle: "readonly",
  localStorage: "readonly",
  Swal: "readonly",
  confetti: "readonly",
  questions5: "readonly",
  questions6: "readonly",
  questions7: "readonly",
  questions8: "readonly",
  finalQuestionsPool5: "readonly",
  finalQuestionsPool6: "readonly",
  finalQuestionsPool7: "readonly",
  finalQuestionsPool8: "readonly",
};

const nodeGlobals = {
  Buffer: "readonly",
  TextDecoder: "readonly",
  URL: "readonly",
  __dirname: "readonly",
  console: "readonly",
  process: "readonly",
  require: "readonly",
  setTimeout: "readonly",
};

const evaluatedBrowserGlobals = {
  ...browserGlobals,
  AI_TEAM_IDS: "readonly",
  FINAL_WINDOW_SECONDS: "readonly",
  aiActive: "readonly",
  currentTurn: "readonly",
  isRolling: "readonly",
  renderTimer: "readonly",
  teams: "readonly",
  timeLeft: "writable",
};

export default [
  {
    files: ["js/game.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: browserGlobals,
    },
    rules: {
      "no-constant-condition": "error",
      "no-dupe-else-if": "error",
      "no-redeclare": "error",
      "no-undef": "error",
      "no-unreachable": "error",
    },
  },
  {
    files: ["tools/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: nodeGlobals,
    },
    rules: {
      "no-constant-condition": "error",
      "no-dupe-else-if": "error",
      "no-redeclare": "error",
      "no-undef": "error",
      "no-unreachable": "error",
    },
  },
  {
    files: ["tools/e2e-test.js"],
    languageOptions: { globals: evaluatedBrowserGlobals },
  },
];
