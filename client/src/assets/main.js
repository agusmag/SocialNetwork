/* FIXED BUTTUNS */
$('.statsCustomButton').on({
    click: function() {
        console.log('Hola!');
        $('.customStatsComponent').toggle('visible');
    }
})



/* RESPONSIVE */

$(window).on({
    resize: function() {
        responsiveLoad($(this));
    },
    load: function() {
        responsiveLoad($(this));
    }
});


function responsiveLoad(window) {
    if (window.width() <= 768) {
        $('.customUserCard').removeClass('col-4');
        $('.customUserCard').addClass('col');
    } else {
        $('.customUserCard').removeClass('col');
        $('.customUserCard').addClass('col-4');
    }
}