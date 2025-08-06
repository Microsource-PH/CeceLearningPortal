// Debug component to test conditional rendering
export const MarketplaceDebug = () => {
  const testCases = [
    { name: "Zero number", value: 0 },
    { name: "Empty string", value: "" },
    { name: "False", value: false },
    { name: "Null", value: null },
    { name: "Undefined", value: undefined },
  ];

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Conditional Rendering Test</h1>
      
      {testCases.map((test, index) => (
        <div key={index} className="border p-4 space-y-2">
          <h3 className="font-semibold">{test.name}</h3>
          
          <div className="space-y-1">
            <p>Direct render: [{test.value}]</p>
            <p>With &&: [{test.value && <span>Show this</span>}]</p>
            <p>With !!: [{!!test.value && <span>Show this</span>}]</p>
            <p>With ternary: [{test.value ? <span>Show this</span> : null}]</p>
          </div>
        </div>
      ))}
      
      <div className="border p-4">
        <h3 className="font-semibold">Course discount test</h3>
        <p>discount = 0: [{0 && <span>Badge</span>}]</p>
        <p>discount = 0 with !!: [{!!0 && <span>Badge</span>}]</p>
        <p>students = 0: [{0 > 0 && <span>Students</span>}]</p>
      </div>
    </div>
  );
};