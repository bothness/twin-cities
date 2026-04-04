// https://svelte.dev/playground/dd6754a2ad0547c5b1c1ea37c0293fef
export default function tooltip(element) {
  let div;
  let title;
  function mouseOver(event) {
    // NOTE: remove the `title` attribute, to prevent showing the default browser tooltip
    // remember to set it back on `mouseleave`
    title = element.firstChild.innerHTML;

    div = document.createElement("div");
    div.textContent = title;
    div.style = `
			border: 1px solid #ddd;
			box-shadow: 1px 1px 1px #ddd;
			background: white;
            color: #222;
			border-radius: 4px;
			padding: 4px;
			position: absolute;
			top: ${event.pageX + 5}px;
			left: ${event.pageY + 5}px;
		`;
        div.style.left = `${event.pageX + 5}px`;
    div.style.top = `${event.pageY + 5}px`;
    document.body.appendChild(div);
  }
  function mouseLeave() {
    document.body.removeChild(div);
  }

  element.addEventListener("mouseover", mouseOver);
  element.addEventListener("mouseleave", mouseLeave);

  return {
    destroy() {
      element.removeEventListener("mouseover", mouseOver);
      element.removeEventListener("mouseleave", mouseLeave);
    },
  };
}
