$(document).ready(function () {
  setTimeout(() => {
    $(".banner .lt h1").addClass("active");
    $(".logo").addClass("active");
    $(".menuBox").addClass("active");
  }, 100);

  setTimeout(() => {
    $(".banner .lt p").addClass("active");

    $(".banner .rt img").addClass("active");
  }, 300);
  setTimeout(() => {
    $(".banner .lt span.pwd").addClass("active");
  }, 450);

  setTimeout(() => {
    $(".banner .lt ul").addClass("active");
  }, 700);

  $(".cardItem").each(function () {
    if ($(this).find("p").text().length > 41)
      $(this)
        .find("p")
        .text($(this).find("p").text().substr(0, 41) + "...");
  });

  function wrpWdth() {
    var wndWdth = $(window).width();
    $(".wrp").css("width", wndWdth);
  }

  function hgtWnd() {
    var hgtScrn = $(window).height();
    $(".slidePanel").css("height", hgtScrn);
  }

  function screenVisible() {
    if ($(".tradingBox").hasClass("in-view")) {
      $(".tradingBox ul li").each(function (i) {
        setTimeout(() => {
          $(this).addClass("active");
        }, i * 200);
      });
    }

    if ($(".why").hasClass("in-view")) {
      $(".why ul li").each(function (i) {
        setTimeout(() => {
          $(this).addClass("active");
        }, i * 200);
      });
    }
  }
  screenVisible();
  wrpWdth();
  hgtWnd();

  $(window).scroll(function () {
    screenVisible();
    wrpWdth();
    hgtWnd();
  });

  $(window).resize(function () {
    wrpWdth();
    hgtWnd();
  });

  var textarea = document.querySelector("textarea");

  textarea.addEventListener("keydown", autosize);

  function autosize() {
    var el = this;
    setTimeout(function () {
      el.style.cssText = "height:auto; padding:0";
      // for box-sizing other than "content-box" use:
      // el.style.cssText = '-moz-box-sizing:content-box';
      el.style.cssText = "height:" + el.scrollHeight + "px";
    }, 0);
  }

  function myFunction() {
    var x = document.getElementById("myFile");
    var txt = "";
    if ("files" in x) {
      if (x.files.length == 0) {
        txt = "Select one or more files.";
      } else {
        for (var i = 0; i < x.files.length; i++) {
          txt += "<br><strong>" + (i + 1) + ". file</strong><br>";
          var file = x.files[i];
          if ("name" in file) {
            //txt += "name: " + file.name + "<br>";
            element.classList.add("mystyle");
          }
        }
      }
    }

    // document.getElementById("demo").innerHTML = txt;
  }

  myFunction();

  var wndHgt = $(window).height();
  var ttl = wndHgt - 130;
  $(".tabContnt").css("height", ttl);

  $(".testDiv").slimscroll({
    height: ttl - 80,
  });

  $(".cancel").on("click", function () {
    location.reload();
  });

  $(function () {
    $(".acc__title").click(function (j) {
      var dropDown = $(this).closest(".acc__card").find(".acc__panel");
      $(this).closest(".acc").find(".acc__panel").not(dropDown).slideUp();

      if ($(this).hasClass("active")) {
        $(this).removeClass("active");
      } else {
        $(this)
          .closest(".acc")
          .find(".acc__title.active")
          .removeClass("active");
        $(this).addClass("active");
      }

      dropDown.stop(false, true).slideToggle();
      j.preventDefault();
    });
  });

  $(".checkmark").on("click", function () {
    $(".checkmark").attr("checked", false);
    $(".slctd").hide();

    var lang = $(this).attr("data-lang");
    $(this)
      .parents(".acc__panel")
      .prev(".acc__title")
      .find(".slctd")
      .css("display", "inline-block");

    var checked = $(this).attr("checked", true);
    if (checked) {
      $(this).attr("checked", false);
    } else {
      $(this).attr("checked", true);
    }
  });

  $(function () {
    $("#datepicker").datepicker({ minDate: 0 });
  });

  $(".tabHead ul li.one").on("click", function () {
    $(".tabHead ul li").removeClass("bold");
    $(".comnTab").removeClass("active");

    $(this).addClass("bold");
    $(this).addClass("active");
    $("#one").addClass("active");
  });

  $(".tabHead ul li.two").on("click", function () {
    $(".tabHead ul li").removeClass("bold");
    $(".comnTab").removeClass("active");

    $(this).addClass("bold");
    $(this).addClass("active");
    $("#two").addClass("active");
  });

  $(".tabHead ul li.three").on("click", function () {
    $(".tabHead ul li").removeClass("bold");
    $(".comnTab").removeClass("active");

    $(this).addClass("bold");
    $(this).addClass("active");
    $("#three").addClass("active");
  });

  $(".prodct").on("click", function (e) {
    $("body").addClass("openSlide");
    $(".menuBox ul li.prodct").addClass("active");
    e.stopPropagation();
  });

  $("span.closePanel").on("click", function () {
    $("body").removeClass("openSlide");
    $(".menuBox ul li.prodct").removeClass("active");
  });

  $("input").focus(function () {
    $(this).parents(".form-group").addClass("focused");
  });

  $("input").blur(function () {
    var inputValue = $(this).val();
    if (inputValue == "") {
      $(this).removeClass("filled");
      $(this).parents(".form-group").removeClass("focused");
    } else {
      $(this).addClass("filled");
    }
  });

  $(document).click(function (e) {
    // if (!$(e.target).is('.prodct, .slidePanel *')) {
    //     $('body').removeClass('openSlide');
    //     $('.prodct').removeClass('active');
    // }

    var lnth = $("#auctnProdct").val().length;
    if (lnth > 0) {
      $(".aucPro.error").hide();
    }

    if ($("#datepicker").val().length) {
    }
  });

  $(document).on(".datepicker-modal button", "click", function () {});

  $("#three .input-group .focus").keypress(function () {
    $(this).parent(".form-group").next().hide();
  });

  $(".timepicker").timepicker();
});