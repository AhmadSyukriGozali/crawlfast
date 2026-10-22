const WORDMARK = "CRAWLFAST";
const STORAGE_KEY = "cf:intro";

/**
 * Runs synchronously while the HTML is parsed, before the first paint, so the
 * curtain state is decided without a flash. `data-intro="play"` also gates the
 * hero choreography through the `--intro-lead` custom property in globals.css.
 */
const INTRO_SCRIPT = `(function(){var d=document.documentElement;try{d.classList.add("has-js");var reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(reduced||sessionStorage.getItem("${STORAGE_KEY}")==="1"){d.dataset.intro="off";return;}sessionStorage.setItem("${STORAGE_KEY}","1");d.dataset.intro="play";var finish=function(){d.dataset.intro="done";};var timer=setTimeout(finish,2550);var skip=function(){clearTimeout(timer);finish();};document.addEventListener("click",skip,{once:true});document.addEventListener("keydown",skip,{once:true});}catch(e){d.dataset.intro="off";}})();`;

export default function IntroCurtain() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }}
      />
      <div className="intro" aria-hidden="true">
        <div className="intro__content">
          <p className="intro__eyebrow">Koleksi 001 — Everyday Edit</p>
          <p className="intro__word">
            {WORDMARK.split("").map((letter, index) => (
              <span key={`${letter}-${index}`} className="intro__letter">
                <span style={{ animationDelay: `${120 + index * 38}ms` }}>
                  {letter}
                </span>
              </span>
            ))}
          </p>
          <div className="intro__bar">
            <span />
          </div>
          <p className="intro__tagline">Everyday essentials, made to last.</p>
        </div>
      </div>
    </>
  );
}
