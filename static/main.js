function calculate_transport(household_size){
  var trans_cost = $("#transport-cost").val();
  var trans_direction = $("#transport-direction").val();
  if (trans_direction=="oneway")
    var out = Math.round(trans_cost * 2 * 5 * 4.33);
  else
    var out = Math.round(trans_cost * 5 * 4.33);
  $("#transport-total").html("R" + out);
  console.log("transport", out);
  return out
}

function calculate_food(household_size){
  var food_cost = $("#food-cost").val();
  // Account for nutrition programme. Effectively kids do not need 1 meal 5 days a week IF education is provided. 16/21*850 for kids
  // Suggests that this program covers at least 30% of daily requirements of the students - Department of Education
  var out = Math.round(food_cost * household_size * 30);
  console.log("food", out);
  $("#food-total").html("R" + out);
  return out
}

function calculate_rent(household_size){
  var rent_cost = $("#rent-cost").val();
  var sanitation_comment=""
  var violence_comment=""
  var out = Math.round(rent_cost)

  //Need comments on sanitation and violence to update with rent options.
  if (rent_cost > 0 && rent_cost < 500)
    sanitation_comment = "Low functionality of bathrooms. High likelihood of communal bathrooms. Low likelihood of frequent trash collection."
  else
    sanitation_comment = "Personal bathroom facilities. Frequent trash collection"
  if (rent_cost > 0 && rent_cost < 900)
    violence_comment = "High likelihood of experiencing gang violence and burglaries."
  else
    violence_comment = "Much lower likelihood of experiencing violence."
  console.log("rent", out);
  $("#rent-total").html("R" + out);
  return out
}

function calculate_education(household_size){
  var kids = $("#education-kids").val()
  var education_cost = $("#education-cost").val()
  if (household_size>2){
    kids = household_size-2;
    out = 300 * (kids);
  }
  else{
    kids=household_size-1;
    out = 300 * (kids);
  }
  var out = education_cost * kids
  console.log("educ", out);
  console.log("kids", kids);
  console.log("household size", household_size);
  $("#education-total").html("R" + out);
  return out
}

function calculate_health(household_size){
  var health_cost=$("#health-cost").val();
  var out = health_cost * household_size;
  console.log("health", out);
  $("#health-total").html("R" + out);
  return out
}

function calculate_communication(household_size){
  var communication_cost = $("#communication-cost").val();
  var out = communication_cost * household_size
  console.log("communication", out);
  $("#communication-total").html("R" + out);
  return out
}

function calculate_recreation(household_size){
  var recreation_cost = $("#recreation-cost").val();
  var out = recreation_cost * household_size;
  console.log("recreation", out);
  $("#recreation-total").html("R" + out);
  return out
}

function calculate_other(household_size){
  var out = $("#other-cost").val() * household_size;
  console.log("other", out);
  $("#other-total").html("R" + out);
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
  console.log("total", total);
  return Math.round(total)
}


function update_output(){

  // read input
  var household_size = $("#household-size").val();
  var pay_rate = $("#pay-rate").val();
  var pay_amount = $("#pay-amount").val();

  if (household_size && pay_rate && pay_amount)
  {
    var monthly_expenditure = calculate_expenditure(household_size);

    // calculate monthly pay
    var monthly_pay = 0;
    // Assumption using DoL info - a month includes 4.33 weeks and a week is for 5 work days.
    if (pay_rate=="day")
      monthly_pay = pay_amount*5*4.33;
    else if (pay_rate=="week")
      monthly_pay = pay_amount*4.33;
    else if (pay_rate=="month")
      monthly_pay = pay_amount;

    var output_percentage = (monthly_pay/monthly_expenditure);
    output_percentage *= 100;
    output_percentage = Math.round(output_percentage);

    var output_statement = "Try out the fair wage tool and see how your pay reflects living costs in South Africa.";
    if ((output_percentage>0) && (output_percentage<= 75))
      output_statement = "You're paying too little given the living costs and the size of your household employee. Take time to reassess how much you're paying by using our tool.";
    else if ((output_percentage>75) && (output_percentage<= 90))
      output_statement = "You're nearly there! Take time to reassess the wage by using our tool or discussing costs with your household employee.";
    else if ((output_percentage>90) && (output_percentage<= 100))
      output_statement = "You're very close to paying a fair wage given the living costs and your employee's household size. Share your results!";
    else if (output_percentage == 0)
      output_statement = "Perhaps you forgot to enter how much you're paying. Please try again!";

    // show results to the user
    $("#output-amount").html("R" + monthly_pay)
    $("#output-monthly-need").html("R" + monthly_expenditure)
    if(output_percentage>=100)
    {
      $("#output-amount").removeClass('label-danger');
      $("#output-amount").removeClass('label-warning');
      $("#output-amount").addClass('label-success');
      $("#output-percentage").removeClass('label-danger');
      $("#output-percentage").removeClass('label-warning');
      $("#output-percentage").addClass('label-success');
    }
    else if(output_percentage>75 && output_percentage<100)
    {
      $("#output-amount").removeClass('label-danger');
      $("#output-amount").addClass('label-warning');
      $("#output-amount").removeClass('label-success');
      $("#output-percentage").removeClass('label-danger');
      $("#output-percentage").addClass('label-warning');
      $("#output-percentage").removeClass('label-success');
    }
    else(output_percentage<=75)
    {
      $("#output-amount").addClass('label-danger');
      $("#output-amount").removeClass('label-warning');
      $("#output-amount").removeClass('label-success');
      $("#output-percentage").addClass('label-danger');
      $("#output-percentage").removeClass('label-warning');
      $("#output-percentage").removeClass('label-success');
    }

    $("#output-percentage").html(output_percentage + "%")
    $("#output-statement").html(output_statement);

    $("#input-container").hide();
    $("#result-container").show(600);
  }
}