import React, { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import { Button, Input, Select, Table, Tabs, Tag } from "antd";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Search } from "lucide-react";
import {
  SearchOutlined,
  DownloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "../../../firebase";
import { Link } from "react-router-dom";
import moment from "moment";
import { limitToFirst } from "firebase/database";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const { TabPane } = Tabs;

const Dashboard = () => {
  const [tab, setTab] = useState("1");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [individualUsers, setIndividualUsers] = useState([]);
  const [filteredIndividualUsers, setFilteredIndividualUsers] = useState([]);
  const [individualPayments, setIndividualPayments] = useState([]);

  const [paymentReport, setPaymentReport] = useState([]);

  const getIndividualUsers = async () => {
    const individualCollection = collection(db, "Individuals");
    const indQry = query(individualCollection, limit(5));
    const snapshot = await getDocs(indQry);
    const usersList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setIndividualUsers(usersList);
    setFilteredIndividualUsers(usersList);
  };

  const getPayments = async () => {
    const paymentsCollection = collection(db, "Payments");
    const payQry = query(paymentsCollection, limit(5));

    const snapshot = await getDocs(payQry, limit(5));
    const paymentsList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("🚀 ~ paymentsList ~ paymentsList:", paymentsList);
    setIndividualPayments(paymentsList);
  };
  const columns = [
    {
      title: " Name",
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: "Registration ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "phone_number",
      key: "phone_number",
    },
  
  ];

  const columns2 = [
    {
      title: "Registration Id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Payment From",
      dataIndex: "user_id",
      key: "user_id",
    },
    {
      title: "Transaction ID",
      dataIndex: "transaction_id",
      key: "transaction_id",
    },
    {
      title: "Payment Type",
      dataIndex: "title",
      key: "title",
    },
    // {
    //   title: "Payment Receive On",
    //   dataIndex: "paymentReceiveOn",
    //   key: "paymentReceiveOn",
    // },
    {
      title: "Payment Date",
      dataIndex: "date",
      key: "date",
      render: (date) => (
        <span>{moment(date)?.format("DD-MM-YYYY") || "NA"}</span>
      ),
    },
    {
      title: "Payment Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span
          className={`tag ${
            status === "Completed"
              ? "bg-green-500"
              : status === "Pending"
              ? "bg-yellow-500"
              : "bg-red-500"
          } text-white px-2 py-1 rounded-full`}
        >
          {status}
        </span>
      ),
    },
  ];

  useEffect(() => {
    getIndividualUsers();
    getPayments();
  }, []);
  const [timePeriod, setTimePeriod] = useState("weekly");
  // const [paymentReport, setPaymentReport] = useState([]);
  const [barData, setBarData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    getPaymentReports();
  }, [timePeriod]);

  const getPaymentReports = async () => {
    const paymentsCollection = collection(db, "Payments");
    const snapshot = await getDocs(paymentsCollection);
    const paymentsList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPaymentReport(paymentsList);
    processChartData(paymentsList);
  };

  const processChartData = (data) => {
    let labels = [];
    let chartData = [];

    switch (timePeriod) {
      case "daily":
        labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        chartData = aggregateDailyData(data);
        break;
      case "weekly":
        labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
        chartData = aggregateWeeklyData(data);
        break;
      case "monthly":
        labels = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        chartData = aggregateMonthlyData(data);
        break;
      default:
        break;
    }

    setBarData({
      labels: labels,
      datasets: [
        {
          label: "Total Fees",
          data: chartData,
          backgroundColor: "#4A90E2",
        },
      ],
    });
  };

  const aggregateDailyData = (data) => {
    let dailyData = Array(7)?.fill(0);
    data?.forEach((payment) => {
      const day = moment(payment?.date)?.day();
      dailyData[day] += payment?.amount;
    });
    return dailyData;
  };

  const aggregateWeeklyData = (data) => {
    let weeklyData = Array(4)?.fill(0);
    data?.forEach((payment) => {
      const week = moment(payment?.date)?.week() % 4;
      weeklyData[week] += payment?.amount;
    });
    return weeklyData;
  };

  const aggregateMonthlyData = (data) => {
    let monthlyData = Array(12)?.fill(0);
    data?.forEach((payment) => {
      const month = moment(payment?.date)?.month();
      monthlyData[month] += payment?.amount;
    });
    return monthlyData;
  };

  const handleTimePeriodChange = (value) => {
    setTimePeriod(value);
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  useEffect(() => {
    getPaymentReports();
  }, [timePeriod]);

  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Candidates",
        data: [300, 200, 400, 300, 200, 250, 350],
        fill: false,
        borderColor: "#4A90E2",
      },
    ],
  };

  return (
    <div className="p-4">
      <h1 className="w-[500px] p-2 text-[#013D9D] text-[18px] font-semibold ">
        Welcome!
      </h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-[#013D9D] text-[18px] font-semibold p-2">
            New Registrations
          </h2>
          <Line data={lineData} options={options} />
        </div>
        <div>
          <h2 className="text-[#013D9D] text-[18px] font-semibold p-2">
            Payments Report
          </h2>
          <div className="flex justify-end">
            <Select
              defaultValue="weekly"
              onChange={handleTimePeriodChange}
              style={{ width: 120 }}
            >
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
            </Select>
          </div>
          <Bar data={barData} options={options} />
        </div>
      </div>
      <div className="mt-9 p-5">
        <Tabs
          activeKey={tab}
          onChange={(w) => {
            setSearchTerm("");
            setFilterStatus("");
            setTab(w);
          }}
        >
          <TabPane tab="New Registrations" key="1">
            <div className="flex justify-end">
              <Input
                className="mb-4 w-80"
                placeholder="Search..."
                onChange={(e) => handleSearch(e.target.value, "individuals")}
                onSearch={(value) => handleSearch(value, "individuals")}
              />
              <Link to={"/dashboard-registration"} className="ml-3">
                <Button className="bg-[#013D9D] text-[#FFFFFF]">
                  View All
                </Button>
              </Link>
            </div>
            <Table
              columns={columns}
              dataSource={filteredIndividualUsers}
              pagination={false}
            />
          </TabPane>
          <TabPane tab="Payment Report" key="2">
            <div className="flex justify-end">
              <Link to={"/dashboard-payment-report"} className="ml-3">
                <Button className="bg-[#013D9D] text-[#FFFFFF]">
                  View All
                </Button>
              </Link>
            </div>
            <Table
              columns={columns2}
              dataSource={individualPayments}
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
