particlesJS("particles-js", {

  particles: {

    number: {
      value: Math.round(78 * (window.PerfCore ? window.PerfCore.particleScale : 1)),
      density: {
        enable: true,
        value_area: 900
      }
    },

    color: {
      value: "#E5C158"
    },

    shape: {
      type: "circle"
    },

    opacity: {
      value: 0.52,
      random: true
    },

    size: {
      value: 3.6,
      random: true
    },

    line_linked: {
      enable: false
    },

    move: {
      enable: true,
      speed: 0.7,
      direction: "none",
      random: true,
      straight: false,
      out_mode: "out"
    }

  },

  interactivity: {

    detect_on: "canvas",

    events: {

      onhover: {
        enable: true,
        mode: "grab"
      },

      onclick: {
        enable: false
      },

      resize: true
    },

    modes: {

      grab: {
        distance: 140,

        line_linked: {
          opacity: 0
        }
      }

    }

  },

  retina_detect: true

});