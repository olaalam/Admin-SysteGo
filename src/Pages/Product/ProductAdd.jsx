import AddPackage from "@/components/AddPage";

const ClientAdd = () => {
  const handleSubmit = (formData) => {
    console.log('Form submitted:', formData);
    alert('Package saved successfully!');
  };

  const handleCancel = () => {
    console.log('Form cancelled');
    alert('Form cancelled');
  };

  // Custom features example
  const customFeatures = [
    { key: 'analytics', label: 'Advanced Analytics', defaultChecked: false },
    { key: 'reporting', label: 'Custom Reporting', defaultChecked: true },
    { key: 'integration', label: 'API Integration', defaultChecked: false },
    { key: 'support', label: '24/7 Support', defaultChecked: false }
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPackage
        title="Add New Package"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        // features={customFeatures} // Optional: custom features
        // initialData={{ name: 'Premium', monthlyFee: '99.99' }} // Optional: initial data
        // showTrialOption={false} // Optional: hide trial option
      />
    </div>
  );
};

export default ClientAdd;