---
---
constants = {
    workdays_per_week: 6,
    weeks_per_month: 4.33,
    workdays_per_month: 6 * 4.33,
    days_per_month: 30,
    sanitation_threshold: 500,
    violence_threshold: 900,
    transition_time: 200,
    output_low: 75, // below this figure salary is too low
    output_almost: 90 // below this figure salary is almost enough
}

function to_currency(val) {
    if (val != parseInt(val)) {
        return "MZN" + commafy(val.toFixed(2));
    } else {
        return "MZN" + commafy(val);
    }
}

function calculate_transport(household_size) {
    var trans_cost = $("#transport-cost").val();
    var trans_direction = $("#transport-direction").val();
    if (trans_direction == "oneway") 
        var out = Math.round(2 * trans_cost * constants.workdays_per_month);
    else 
        var out = Math.round(trans_cost * constants.workdays_per_month);
    
    $("#transport-total").html(to_currency(out));

    return out
}

function calculate_food(household_size) {
    var food_cost = $("#food-cost").val();
    // Account for nutrition programme. Effectively kids do not need 1 meal 5 days a
    // week IF education is provided. 16/21*850 for kids Suggests that this program
    // covers at least 30% of daily requirements of the students - Department of
    // Education
    var out = Math.round(food_cost * household_size * constants.days_per_month);

    $("#food-total").html(to_currency(out));

    return out
}

function calculate_rent(household_size) {
    var rent_cost = $("#rent-cost").val();
    var sanitation_comment = ""
    var violence_comment = ""
    var out = Math.round(rent_cost)

    //Need comments on sanitation and violence to update with rent options.
    if (rent_cost > 0 && rent_cost < constants.sanitation_threshold) 
        sanitation_comment = "Baixa funcionalidade dos banheiros. Alta probabilidade de banheiro comum. Baixa probabilidade" +
                "capuz de coleta de lixo confiável."
    else 
        sanitation_comment = "Personal bathroom facilities. Reliable trash collection"

    if (rent_cost > 0 && rent_cost < constants.violence_threshold) 
        violence_comment = "Alta probabilidade de sofrer violência de gangues e roubos."
    else 
        violence_comment = "Probabilidade muito menor de sofrer violência."

    $("#rent-total").html(to_currency(out));

    return out
}

function calculate_education(household_size) {
    var kids = $("#education-kids").val()
    var education_cost = $("#education-cost").val()
    var out = education_cost * (kids);

    $("#education-total").html(to_currency(out));

    return out
}

function calculate_health(household_size) {

    var health_cost = $("#health-cost").val();
    var out = health_cost * household_size;
    var health_comment = ""

    $("#health-total").html(to_currency(out))

    return out
}

function calculate_communication(household_size) {
    var communication_cost = $("#communication-cost").val();
    var out = communication_cost * household_size

    $("#communication-total").html(to_currency(out))

    return out
}

function calculate_recreation(household_size) {
    var recreation_cost = $("#recreation-cost").val();
    var out = recreation_cost * household_size;

    $("#recreation-total").html(to_currency(out))

    return out
}

function calculate_other(household_size) {
    var out = $("#other-cost").val() * household_size;

    $("#other-total").html(to_currency(out))

    return out
}

function calculate_expenditure(household_size) {
    var total = 0;

    total += calculate_rent(household_size);
    total += calculate_food(household_size);
    total += calculate_transport(household_size);
    total += calculate_education(household_size);
    total += calculate_health(household_size);
    total += calculate_communication(household_size);
    total += calculate_recreation(household_size);
    total += calculate_other(household_size);

    return Math.round(total)
}

function highlight_output(class_name) {
    var available_classes = ['label-danger', 'label-warning', 'label-success']
    if ($.inArray(class_name, available_classes) > -1) {
        for (var i = 0; i < available_classes.length; i++) {
            var tmp = available_classes[i];
            $("#output-percentage").removeClass(tmp);
        }
        $("#output-percentage").addClass(class_name);
    }
}

function update_display(class_name) {
    var transition_time = constants.transition_time;
    var available_classes = ['display-landing', 'display-results', 'display-assumptions']

    if ($.inArray(class_name, available_classes) > -1) {

        for (var i = 0; i < available_classes.length; i++) {
            var tmp = available_classes[i];
            // hide some stuff
            if (tmp != class_name) {
                $("." + tmp)
                    .each(function () {
                        if (!$(this).hasClass(class_name)) {
                            $(this).slideUp(transition_time);
                        }
                    });
            }

            // show some stuff
            $("." + class_name)
                .each(function () {
                    $(this).slideDown(transition_time);
                })
        }
    }
    setTimeout(function() {
        pymChild.sendHeight();
    }, transition_time)
}

function validate_input(household_size, pay_rate, pay_amount) {
    if (!$.isNumeric(pay_amount)) {
        $("#pay-amount-" + pay_rate).parents('.form-group').addClass('has-error');
        $("#pay-amount-" + pay_rate).focus();
        pay_amount = false;
    }
    if (household_size && pay_rate && pay_amount) {
        // update user feedback text
        $("#household-size-feedback").html(household_size + " pessoa")
        return true
    }
    return false
}

function update_sliders(rate) {
    // Update all the sliders to show the equivalent of the matching value

    $("#pay-amount-day").slider('setValue', $("#pay-amount").val() / constants.workdays_per_month, true);
    $("#pay-amount-week").slider('setValue', $("#pay-amount").val() / constants.weeks_per_month, true);
    $("#pay-amount-month").slider('setValue', parseFloat($("#pay-amount").val()), true);

    // Hide all sliders.
    $("#outer-pay-amount-day").hide();
    $("#outer-pay-amount-week").hide();
    $("#outer-pay-amount-month").hide();

    // Show the slider matching the selected rate.
    $("#outer-pay-amount-" + rate).show();
}

function update_output() {

    // read input
    var household_size = $("#household-size").val();
    var pay_rate = $("#pay-rate").val();
    var pay_amount = $("#pay-amount-" + pay_rate).val();

    if (validate_input(household_size, pay_rate, pay_amount)) {
        // Assumption: Monthly Expenditure is contribution of 80% of the total household expenditure
        var household_contribution = 0.8;
        var monthly_expenditure = calculate_expenditure(household_size) * household_contribution;

        // calculate monthly pay
        var monthly_pay = 0;
        // Assumption using DoL info - a month includes 4.33 weeks and a week is for 5
        // work days.
        if (pay_rate == "day") {
            monthly_pay = pay_amount * constants.workdays_per_month;
        }
        else if (pay_rate == "week") {
            monthly_pay = pay_amount * constants.weeks_per_month;
        }
        else if (pay_rate == "month") {
            monthly_pay = pay_amount;
        }

        // Update the overall pay-amount input box.
        $("#pay-amount").val(monthly_pay);
        
        var output_percentage = (monthly_pay / monthly_expenditure);
        output_percentage *= 100;
        output_percentage = Math.round(output_percentage);

        var output_statement = "Experimente a ferramenta de salário justo e veja como seu salário reflete o custo de vida no Sul da" +
                "frica.";
        if ((output_percentage >= 0) && (output_percentage < constants.output_low)) {
            output_statement = "Você está pagando muito pouco, considerando o custo de vida e o tamanho do seu problema doméstico." +
                    "Reserve um tempo para reavaliar quanto você está pagando usando nossa ferramenta" +
                    ".";
            highlight_output('label-danger');
        } else if ((output_percentage >= 75) && (output_percentage < constants.output_almost)) {
            output_statement = "Você está quase lá! Reserve um tempo para reavaliar o salário usando nossa ferramenta ou discuta" +
                    "custos com seu trabalhador doméstico.";
            highlight_output('label-warning');
        } else if ((output_percentage >= constants.output_almost) && (output_percentage < 100)) {
            output_statement = "Você está muito perto de pagar um salário justo, considerando o custo de vida e o tamanho de sua casa" +
                    "a casa da nossa empregada doméstica. Compartilhe seus resultados!";
            highlight_output('label-warning');
        } else {
            output_statement = "Você está cobrindo as necessidades mínimas de seus trabalhadores domésticos. Compartilhe seus resultados!";
            highlight_output('label-success');
        }

        // show results to the user
        $("#output-amount").html(to_currency(monthly_pay))
        $("#output-monthly-need").html(to_currency(monthly_expenditure * 1/household_contribution))

        $("#output-percentage").html(output_percentage + "%")
        $("#output-statement").html(output_statement);
        change_twitter_text("Eu pago MZN à minha empregada doméstica." + monthly_pay + " qual é " + output_percentage + "% de sua necessidade mensal, quanto você paga?");
        return true
    }
    return false
}

function change_twitter_text(txt) {
    if (typeof(twttr) != "undefined") {
        // Remove existing iframe
        $('#tweetBtn iframe').remove();
        // Generate new markup
        var tweetBtn = $('<a></a>')
            .addClass('twitter-share-button')
            .attr('href', 'http://twitter.com/share')
            .attr('data-url', '{{ site.url }}')
            .attr('data-via', '{{ site.twitter }}')
            .attr('data-text', txt)
            .attr('data-count', 'horizontal')
            .attr('data-hashtags', 'livingwage');
        $('#tweetBtn').append(tweetBtn);
        twttr.widgets.load();
    }
}

function clearIntro(intervalObject) {
    clearInterval(intervalObject);
    $('#slideshow').css('display', 'none');
    $('#skip').css('display', 'none');
    $('#content').css('display', 'block');
}

$(document)
    .ready(function () {

        $("#slideshow > div:gt(0)").hide();
        var inter = setInterval(function () {
            $('#slideshow > div:first')
                .fadeOut(500)
                .next()
                .fadeIn(800)
                .end()
                .appendTo('#slideshow');
            setTimeout(function () {
                clearIntro(inter)
            }, 35000);
        }, 5000);

        $(window).scroll(function () {
            $(".arrow").css("opacity", 1 - $(window).scrollTop() / 250);
        });

        // function for scrolling around website (links to "#section" will scroll to
        // that section)
        $('a[href^="#"]').on('click', function (e) {
            e.preventDefault();

            var target = this.hash;
            var $target = $(target);

            $('html, body')
                .stop()
                .animate({
                    'scrollTop': $target
                        .offset()
                        .top - 15
                }, 900, 'swing');
        });

        $('#skip').on('click', function () {
            clearIntro(inter);
        });

        $("#pay-amount-day").focus();

        // initialize dropdown selects
        $("#pay-rate")
            .selectpicker()
            .on("change", function () {
                update_sliders($("#pay-rate").val());
                update_output();
            })
        $("#pay-amount-day").on("change", function() {
            update_output();
        })
        $("#pay-amount-week").on("change", function() {
            update_output();
        })
        $("#pay-amount-month").on("change", function () {
            update_output();
        })
        $('#assumption-container .selectpicker')
            .selectpicker()
            .on("change", function () {
                update_output();
            });

        // update output based on default input values
        update_output();

        // update on click
        var twitter_bound = false;
        $("#go-button").on('click', function (e) {
            // attach twitter widget events
            if (!twitter_bound && typeof(twttr) != "undefined") {
                twttr
                    .events
                    .bind('click', function (e) {
                        ga('send', 'event', 'twitter', 'click');
                    });
                twttr
                    .events
                    .bind('tweet', function (e) {
                        ga('send', 'event', 'twitter', 'tweet');
                    });
                twitter_bound = true;
            }

            e.preventDefault();
            if (update_output()) {
                update_display('display-results');
            }
        })

        $("#show-assumptions-btn").on('click', function () {
            update_display('display-assumptions');
        })

        function currency_formater(value,  symbol='MZN') {
            return symbol + ' ' + value;
        }

        function child_formater(value) {
            if (value == 1) 
                return '1 child';
            else 
                return value + ' children';
            }
        
        function people_formater(value) {
            if (value == 1) 
                return '1 person';
            else 
                return value + ' people';
            }
        
        $(this)
            .find(".slider")
            .each(function (i) {
                var tmp_formater = currency_formater;
                if ($(this).attr("data-slider-formater") == "children") 
                    tmp_formater = child_formater;
                else if ($(this).attr("data-slider-formater") == "people") 
                    tmp_formater = people_formater;
                
                $(this)
                    .slider({tooltip: 'always', formater: tmp_formater})
                    .on('slideStop', function (event) {
                        $(this).attr("data-slider-val", $(this).val())
                        update_output()
                    });
            })
    });
