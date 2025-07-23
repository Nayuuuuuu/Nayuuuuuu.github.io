const btnSubmit=document.querySelector("#btnSubmit");
btnSubmit.addEventListener("click", CheckAns);
const scorebox=document.querySelector("#scorebox");
var q1, q2, score = 0;

function CheckAns() 
{
    score = 0; // reset score to 0, check ans and give score if correct
    q1=document.querySelector("input[name='q1']:checked").value;
    console.log(q1); // check q1 value retrieved
    if(q1=="Tokyo")score++;

    scorebox.innerHTML="Score "+score;
}