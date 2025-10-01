const Title = ({ userCount }) => {

  return(
    <div className="flex flex-col items-center -space-y-6">
      <p className="text-6xl font-honk p-6">TacMap</p>
      <p className="text-sm font-lilita italic">Users Online: {userCount}</p>
    </div>
  );

}

export default Title;