
$(document).ready(function () {

    // $('.cardBox.frstCard .cardItem').each(function (i) {
    //     setTimeout(() => {
    //         $(this).addClass('active');
    //     }, i * 150);
    // })

    setTimeout(() => {
        $('.banner .lt h1').addClass('active');
        $('.logo').addClass('active')
        $('.menuBox').addClass('active')
    }, 100);

    setTimeout(() => {
        $('.banner .lt p').addClass('active')

        $('.banner .rt img').addClass('active')
    }, 300);
    setTimeout(() => {
        $('.banner .lt span.pwd').addClass('active')
    }, 450);

    setTimeout(() => {
        $('.banner .lt ul').addClass('active')
    }, 700);



    $('.cardItem').each(function () {
        if ($(this).find('p').text().length > 41)
            $(this).find('p').text($(this).find('p').text().substr(0, 41) + '...');
    })


    function screenVisible() {
        var scrollTop = $(window).scrollTop();
        var windowHeight = $(window).height();
        var first = false;
        $(".moveup").each(function () {
            var offset = $(this).offset();
            if (scrollTop <= offset.top && ($(this).height() + offset.top) < (scrollTop + windowHeight + 200) && first == false) {
                $(this).addClass("inscreen");
                first = true;
            } else {
                $(this).removeClass("inscreen");
                first = false;
            }
        });

        $(".moveup2").each(function () {
            var offset = $(this).offset();
            if (scrollTop <= offset.top && ($(this).height() + offset.top - 500) < (scrollTop + windowHeight) && first == false) {
                $(this).addClass("inscreen");
                first = true;
            } else {
                $(this).removeClass("inscreen");
                first = false;
            }
        });

        if ($('.tradingBox').hasClass('inscreen')) {
            $('.tradingBox ul li').each(function (i) {
                setTimeout(() => {
                    $(this).addClass('active');
                }, i * 200);
            })
        }

        if ($('.why').hasClass('inscreen')) {
            $('.why ul li').each(function (i) {
                setTimeout(() => {
                    $(this).addClass('active');
                }, i * 200);
            })
        }

    }
    screenVisible()


    $(window).scroll(function () {
        screenVisible()

    });



    var textarea = document.querySelector('textarea');

    textarea.addEventListener('keydown', autosize);

    function autosize() {
        var el = this;
        setTimeout(function () {
            el.style.cssText = 'height:auto; padding:0';
            // for box-sizing other than "content-box" use:
            // el.style.cssText = '-moz-box-sizing:content-box';
            el.style.cssText = 'height:' + el.scrollHeight + 'px';
        }, 0);
    }

    function myFunction() {
        var x = document.getElementById("myFile");
        var txt = "";
        if ('files' in x) {
            if (x.files.length == 0) {
                txt = "Select one or more files.";
            } else {
                for (var i = 0; i < x.files.length; i++) {
                    txt += "<br><strong>" + (i + 1) + ". file</strong><br>";
                    var file = x.files[i];
                    if ('name' in file) {
                        //txt += "name: " + file.name + "<br>";
                        element.classList.add("mystyle");
                    }

                }
            }
        }

        // document.getElementById("demo").innerHTML = txt;
    }

    myFunction()


    var wndHgt = $(window).height()
    var ttl = wndHgt - 120;
    $('.tabContnt').css('height', '658px');

    $('#testDiv').slimscroll({
        height: ttl
    })

    $('.sbmt.first').on('click', function () {
        $('.tabHead ul li.two').addClass('active');
        $('.tabHead ul li.two').addClass('bold');

        $('#two').addClass('active');
        $('#one').removeClass('active');
        $('.one').removeClass('bold');
    })

    $('.sbmt.scnd').on('click', function () {
        $('.tabHead ul li.two').removeClass('bold');

        $('.tabHead ul li.three').addClass('active');
        $('.tabHead ul li.three').addClass('bold');

        $('#three').addClass('active');
        $('#two').removeClass('active');

    })


    $(function () {
        $('.acc__title').click(function (j) {

            var dropDown = $(this).closest('.acc__card').find('.acc__panel');
            $(this).closest('.acc').find('.acc__panel').not(dropDown).slideUp();

            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
            } else {
                $(this).closest('.acc').find('.acc__title.active').removeClass('active');
                $(this).addClass('active');
            }

            dropDown.stop(false, true).slideToggle();
            j.preventDefault();
        });
    });


    $('.checkmark').on('click', function () {
        $('.checkmark').attr('checked', false);
        $('.slctd').hide();

        var lang = $(this).attr('data-lang');
        $(this).parents('.acc__panel').prev('.acc__title').find('.slctd').css('display', 'inline-block');

        var checked = $(this).attr('checked', true);
        if (checked) {
            $(this).attr('checked', false);
        }
        else {
            $(this).attr('checked', true);
        }

    })


    $(function () {
        $("#datepicker").datepicker();
    });

    $('#timepicker').timepicker();

    $('.tabHead ul li.one').on('click', function () {
        $('.tabHead ul li').removeClass('bold');
        $('.comnTab').removeClass('active');

        $(this).addClass('bold');
        $(this).addClass('active');
        $('#one').addClass('active')

    })

    $('.tabHead ul li.two').on('click', function () {
        $('.tabHead ul li').removeClass('bold');
        $('.comnTab').removeClass('active');

        $(this).addClass('bold');
        $(this).addClass('active');
        $('#two').addClass('active')

    })

    $('.tabHead ul li.three').on('click', function () {
        $('.tabHead ul li').removeClass('bold');
        $('.comnTab').removeClass('active');

        $(this).addClass('bold');
        $(this).addClass('active');
        $('#three').addClass('active')

    })



    var wndWdth = $(window).width();
    $('.wrp').css('width', wndWdth);


    $('.prodct').on('click', function () {
        $('body').addClass('openSlide');
        $('.menuBox ul li.prodct').addClass('active');
    })

    $('span.closePanel').on('click', function() {
        $('body').removeClass('openSlide');
        $('.menuBox ul li.prodct').removeClass('active');
    })


});






