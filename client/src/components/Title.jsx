const Title = ({ userCount, darkmode }) => {

  return(
    <div className="flex flex-col items-center -space-y-6">
      <p className="text-6xl font-honk p-6">TacMap</p>
      <p className={`text-sm font-lilita italic ${darkmode ? "text-[#ECDBBA]" : "text-[#521C0D]"}`}>Users Online: {userCount}</p>
    </div>
  );

}

export default Title;