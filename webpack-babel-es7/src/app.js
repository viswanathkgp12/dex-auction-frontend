async function hello() {
  return new Promise((res, rej) => {
    res("You made it! This message is from Async/Await.");
  });
};

async function call() {
  const el = document.createElement("h3");
  el.innerText = await hello();
  document.body.appendChild(el);
}

call();
