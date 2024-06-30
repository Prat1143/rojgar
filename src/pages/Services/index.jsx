import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Tabs,
  Form,
  Input,
  Space,
  Select,
  Modal,
  Divider,
  Radio,
  notification,
  Card,
} from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import TabPane from "antd/es/tabs/TabPane";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { CrossIcon, Minus, MinusCircle, XIcon } from "lucide-react";
import moment from "moment";

let index1 = 0;
const { Option } = Select;

const Index = () => {
  const [suggestiveList, setSuggestiveList] = useState([]);
  const [form] = Form.useForm();
  const [skillingForm] = Form.useForm();
  const [addNewCourseForm] = Form.useForm();
  const [createSubscriptionForm] = Form.useForm();
  const [welfareForm] = Form.useForm();
  const [createNewVolunteer] = Form.useForm();
  const [documentService] = Form.useForm();
  const [suggestiveForm] = Form.useForm();
  const [companyForm] = Form.useForm();
  const [courses, setCourses] = useState([]);

  const addCourse = () => {
    setCourses([...courses, { key: courses.length }]);
  };

  const removeCourse = (key) => {
    setCourses(courses.filter((course) => course.key !== key));
  };
  const [workshops, setWorkshops] = useState([""]);
  const addWorkshopInput = () => {
    setWorkshops([...workshops, ""]);
  };

  const handleWorkshopChange = (index, value) => {
    const newWorkshops = [...workshops];
    newWorkshops[index] = value;
    setWorkshops(newWorkshops);
  };

  //////////////////////////////////////////////////////////////////////////////////

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [welfareList, setWelfaresList] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [subscriptionTabs, setSubscriptionTabs] = useState([]);
  const [tab, setTab] = useState("Trades");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSkillingModal, setIsSkillingModal] = useState(false);
  const [skilling, setSkilling] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [isSkillingModalVisible, setIsSkillingModalVisible] = useState(false);
  const [isAddNewVolunteerModalVisible, setIsAddNewVolunteerModal] =
    useState(false);
  const [volunteer, setVolunteer] = useState([]);

  const getVolunteer = async () => {
    try {
      const coursesCollection = collection(db, "Courses");
      const q = query(coursesCollection, where("is_volunteer", "==", true));

      const snapshot = await getDocs(q);
      const coursesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVolunteer(coursesList);
      console.log("🚀 ~ getVolunteer ~ coursesList:", coursesList);
    } catch (error) {
      console.error("Error fetching volunteer courses:", error);
    }
  };
  const handleSessionUpdate = async (courseId, sessionNumber, newData) => {
    try {
      const courseRef = doc(db, "Courses", courseId);
      await updateDoc(courseRef, {
        [`session.name_${sessionNumber}`]: newData.name,
        [`session.date_${sessionNumber}`]: newData.date,
        [`session.time_slot_${sessionNumber}`]: newData.timeSlot,
      });
      console.log(
        `Session ${sessionNumber} updated successfully for course ${courseId}`
      );
    } catch (error) {
      console.error("Error updating session:", error);
    }
  };
  const getSubscriptionPlans = async () => {
    const welfareCollection = collection(db, "Subscription Plans");
    const listSnapshot = await getDocs(welfareCollection);
    const listData = listSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSubscriptionPlans(listData);
    const sTabs = listData?.map((data) => {
      return {
        key: data?.id,
        label: data?.name,
        children: (
          <div>
            <Form
              layout="vertical"
              onFinish={handelSubscriptionPlan}
              initialValues={{
                benefits: data?.benefits,
                plan_name: data?.name,
                plan_price: data?.price,
                plan_tenure: data?.per,
                id: data?.id,
              }}
            >
              <div className="flex gap-3 items-start">
                <div className="shadow p-5 rounded-lg">
                  <Form.List
                    name="benefits"
                    rules={[
                      {
                        validator: async (_, benefits) => {
                          if (!benefits || benefits.length < 1) {
                            return Promise.reject(
                              new Error("At least 1 benefits")
                            );
                          }
                        },
                      },
                    ]}
                  >
                    {(fields, { add, remove }, { errors }) => (
                      <div className="flex flex-col w-80">
                        {fields.map((field, index) => (
                          <Form.Item
                            className="w-full"
                            label={index === 0 ? "Benefits" : ""}
                            required={false}
                            key={field.key}
                          >
                            <div className="flex flow-row gap-2 items-center justify-center">
                              <Form.Item
                                className="w-full"
                                {...field}
                                validateTrigger={["onChange", "onBlur"]}
                                rules={[
                                  {
                                    required: true,
                                    whitespace: true,
                                    message:
                                      "Please input Benefits name or delete this field.",
                                  },
                                ]}
                                noStyle
                              >
                                <Input placeholder="Benefit name" />
                              </Form.Item>
                              {fields.length > 0 ? (
                                <MinusCircle
                                  className="dynamic-delete-button text-red-500"
                                  onClick={() => remove(field.name)}
                                />
                              ) : null}
                            </div>
                          </Form.Item>
                        ))}
                        <Form.Item>
                          <Button
                            type="dashed"
                            onClick={() => add()}
                            icon={<PlusOutlined />}
                          >
                            Add field
                          </Button>

                          <Form.ErrorList errors={errors} />
                        </Form.Item>
                      </div>
                    )}
                  </Form.List>
                </div>
                <div className="shadow p-5 rounded-lg">
                  <Form.Item
                    label="Plan Name"
                    className="w-80"
                    name="plan_name"
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Please input plan name",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item hidden className="w-80" name="id">
                    <Input />
                  </Form.Item>
                </div>
                <div className="shadow p-5 rounded-lg w-52">
                  <Form.Item
                    label="Plan Tenure"
                    name="plan_tenure"
                    rules={[
                      {
                        required: true,
                        message: "Please select plan tenure",
                      },
                    ]}
                  >
                    <Select>
                      <Option value="Monthly">Monthly</Option>
                      <Option value="Yearly">Yearly</Option>
                    </Select>
                  </Form.Item>
                </div>
                <div className="shadow p-5 rounded-lg">
                  <Form.Item
                    label="Price (₹)"
                    name="plan_price"
                    rules={[
                      {
                        required: true,

                        message: "Please input plan price",
                      },
                    ]}
                  >
                    <Input type="number" />
                  </Form.Item>
                </div>
              </div>
              <Form.Item className="my-5 flex justify-center">
                <Button htmlType="submit" type="primary">
                  Save
                </Button>
              </Form.Item>
            </Form>
          </div>
        ),
      };
    });

    setSubscriptionTabs(sTabs);
  };
  const getWelfare = async () => {
    const welfareCollection = collection(db, "All Welfare Schemes");
    const listSnapshot = await getDocs(welfareCollection);
    const listData = listSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setWelfaresList(listData);
  };
  const getDocuments = async () => {
    const documentCollection = collection(db, "All Documents");
    const listSnapshot = await getDocs(documentCollection);
    const listData = listSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setDocuments(listData);
  };
  const getSkilling = async () => {
    const skillingCollection = collection(db, "Skills");
    const listSnapshot = await getDocs(skillingCollection);
    const skills = listSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const coursesCollection = collection(db, "Courses");
    const snap = await getDocs(coursesCollection);
    const courses = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Create a mapping of skills by their IDs
    const skillsMap = skills.reduce((acc, skill) => {
      acc[skill.id] = { ...skill, courses: [] };
      return acc;
    }, {});

    // Assign each course to the corresponding skill
    courses.forEach((course) => {
      const { skillId } = course;
      if (skillsMap[skillId]) {
        skillsMap[skillId].courses.push(course);
      }
    });

    // Convert the skills map back to an array
    const listData = Object.values(skillsMap);
    console.log("🚀 ~ getSkilling ~ listData:", listData);

    // Assuming you have a state setter for skilling
    setSkilling(listData);
  };
  const getSuggestiveList = async () => {
    const suggestiveListCollection = collection(db, "All Suggestive Lists");
    const listSnapshot = await getDocs(suggestiveListCollection);
    const listData = listSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const groupedData = listData?.reduce((acc, item) => {
      const { type } = item;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(item);
      return acc;
    }, {});
    setSuggestiveList(groupedData);
    setLoading(false);
  };
  const createSuggestiveList = async (name) => {
    try {
      await addDoc(collection(db, "All Suggestive Lists"), {
        name,
        type: tab,
      });
      notification.success({
        message: "Item Added",
        description: `Suggestive ${name} has been added successfully.`,
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to Create Please try again later.",
      });
    } finally {
      getSuggestiveList();
      suggestiveForm.resetFields();
    }
  };
  const deleteSuggestiveList = async (id, name) => {
    try {
      await deleteDoc(doc(db, "All Suggestive Lists", id));
      notification.success({
        message: "Item Deleted",
        description: `Suggestive ${name} has been deleted successfully.`,
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to delete item. Please try again later.",
      });
    } finally {
      getSuggestiveList();
    }
  };
  const createScheme = async (name, amount) => {
    try {
      await addDoc(collection(db, "All Welfare Schemes"), {
        name,
        amount,
      });
      notification.success({
        message: "Item Added",
        description: `Suggestive ${name} has been added successfully.`,
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to Create Please try again later.",
      });
    } finally {
      getWelfare();
      welfareForm.resetFields();
    }
  };
  const deleteWelfareSchemes = async (id, name) => {
    try {
      await deleteDoc(doc(db, "All Welfare Schemes", id));
      notification.success({
        message: "Item Deleted",
        description: `Welfare Schemes ${name} has been deleted successfully.`,
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to delete item. Please try again later.",
      });
    } finally {
      getWelfare();
    }
  };
  const createDocument = async (name, amount) => {
    try {
      await addDoc(collection(db, "All Documents"), {
        name,
        amount,
      });
      notification.success({
        message: "Item Added",
        description: `Documents ${name} has been added successfully.`,
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to Create Please try again later.",
      });
    } finally {
      documentService.resetFields();
      getDocuments();
    }
  };
  const deleteDocument = async (id, name) => {
    try {
      await deleteDoc(doc(db, "All Documents", id));
      notification.success({
        message: "Item Deleted",
        description: `Documents ${name} has been deleted successfully.`,
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to delete item. Please try again later.",
      });
    } finally {
      getDocuments();
    }
  };
  const handelCreateJobPost = async (value) => {
    try {
      const compony = await addDoc(collection(db, "RegisterAsCompany"), {
        city: "",
        company_email: value.email,
        company_name: value?.companyName,
        date_of_registration: moment().format("DD-MM-YYYY HH:mm:ss"),
        gstin: value?.companyGstin,
        job_poster_email: value.email,
        job_poster_name: "",
        job_poster_phone_number: value.phone,
        pin: value?.companyPin,
        profile_type: "Company",
        registered_address: value?.companyAddress,
        state: value?.companyState,
        status: "Completed",
        verified: false,
        subscription: "",
      });

      await addDoc(collection(db, "Jobs"), {
        benefits: value?.otherBenefits,
        company_id: compony?.id,
        experience_required: value?.experienceRequired,
        job_openings: value?.numberOfOpenings,
        job_place: value?.jobPlace,
        job_position: value?.jobPosition,
        min_experience_in_months: 0,
        payout_from: value?.payout_from,
        payout_to: value?.payout_to,
        posted_on: moment().format("DD-MM-YYYY HH:mm:ss"),
        qualification: value?.educationQualification,
        skills_required: value?.skillRequired,
      });
      notification.success({
        message: "Item Added",
        description: `Job has been added successfully.`,
      });
      companyForm.resetFields();
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to Create Please try again later.",
      });
    } finally {
    }
  };
  const handelSubscriptionPlan = async (values) => {
    try {
      const planRef = doc(db, "Subscription Plans", values?.id);
      await updateDoc(planRef, {
        benefits: values?.benefits,
        name: values?.plan_name,
        per: values?.plan_tenure,
        price: values?.plan_price,
      });
      notification.success({
        message: "Subscription Updated",
        description: `Subscription Updated successfully.`,
      });
    } catch (error) {
      console.log("🚀 ~ handelSubscriptionPlan ~ error:", error);
      notification.error({
        message: "Error",
        description: "Failed to update Please try again later.",
      });
    } finally {
      getSubscriptionPlans();
    }
  };
  const handleCreateSubscriptionPlan = async (values) => {
    try {
      console.log("Received values:", values);

      const subscriptionPlan = {
        name: values.plan_name,
        price: values.plan_price,
        per: values.plan_tenure,
        benefits: values.benefits,
      };

      await addDoc(collection(db, "Subscription Plans"), subscriptionPlan);

      notification.success({
        message: "Success",
        description: "Subscription plan added successfully!",
      });

      setIsModalVisible(false);
      createSubscriptionForm.resetFields();
      getSubscriptionPlans();
    } catch (errorInfo) {
      notification.error({
        message: "Error",
        description: "Failed to add subscription plan. Please try again later.",
      });
      console.log("Validation Failed:", errorInfo);
    }
  };
  const onFinish = async (values) => {
    try {
      const { programName } = values;

      // 1. Add the program
      const program = await addDoc(collection(db, "Skills"), {
        name: programName,
        isFree: true,
      });
      console.log("🚀 ~ program ~ program:", program, program.id);

      // 2. Add each course
      const courses = [];
      for (let i = 0; values[`courseName${i}`] !== undefined; i++) {
        const courseName = values[`courseName${i}`];
        const courseVideoLink = values[`courseVideoLink${i}`];
        const amount = values[`amount${i}`];
        const location = values[`location${i}`];
        const courseType = values[`courseType${i}`] === "free" ? true : false;

        // Add course to courses array or database directly
        courses.push({
          skillId: program.id,
          name: courseName,
          video_link: courseVideoLink,
          isFree: courseType,
          amount: amount,
          location: location,
        });

        await addDoc(collection(db, "Courses"), {
          skillId: program.id,
          name: courseName,
          video_link: courseVideoLink,
          amount: amount,
          isFree: true,
          location: location,
        });
      }

      form.resetFields();
      console.log("Courses added:", courses);
      notification.success({
        message: "Success",
        description: "Skills and courses added successfully!",
      });
    } catch (error) {
      console.log("🚀 ~ onFinish ~ error:", error);
    }
  };
  const handleSkillChange = (value) => {
    const skill = skilling.find((skill) => skill.id === value);
    setSelectedSkill(skill);
    const coursesData = skill.courses.map((course, index) => ({
      [`courseName${index}`]: course.name,
      [`video_link${index}`]: course.video_link,
      [`course_id${index}`]: course.id,
      [`amount${index}`]: course?.amount,
      [`location${index}`]: course?.location,
      [`courseType${index}`]: course.isFree ? "free" : "paid",
    }));
    skillingForm.setFieldsValue({
      // programName: skill.name,
      ...Object.assign({}, ...coursesData),
    });
  };
  const handleFormSubmit = async (values) => {
    try {
      // Iterate through the form values to update each course
      for (let i = 0; values[`courseName${i}`] !== undefined; i++) {
        const courseId = values[`course_id${i}`];
        const courseName = values[`courseName${i}`];
        const amount = values[`amount${i}`];
        const location = values[`location${i}`];
        const courseVideoLink = values[`video_link${i}`];
        const courseType = values[`courseType${i}`] === "free";

        // Update existing course
        const courseRef = doc(db, "Courses", courseId);
        await updateDoc(courseRef, {
          name: courseName,
          video_link: courseVideoLink,
          isFree: courseType,
          amount: amount,
          location: location,
        });
      }
      notification.success({
        message: "Success",
        description: "Courses updated successfully!",
      });
      getSkilling();
      console.log("Courses updated successfully.");
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to update courses. Please try again later.",
      });
      console.log("🚀 ~ updateCourses ~ error:", error);
    }
  };
  const handleAddCourse = async (values) => {
    try {
      await addDoc(collection(db, "Courses"), {
        skillId: selectedSkill?.id,
        name: values.courseName,
        video_link: values.courseVideoLink,
        amount: values.amount,
        location: values.location,
        isFree: values.courseType === "free",
      });
      addNewCourseForm.resetFields();
      setIsSkillingModalVisible(false);
      setSelectedSkill(null);
      getSkilling();
      notification.success({
        message: "Success",
        description: "Course added successfully!",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to add course. Please try again later.",
      });
      console.log("🚀 ~ handleAddCourse ~ error:", error);
    }
  };
  const handelCreateVolunteer = async (value) => {
    try {
      const volunteer = {
        name: value?.volunteerName,
        is_volunteer: true,
        isFree: true,
        session: {
          name_1: value?.sessionName1,
          name_2: value?.sessionName2,
        },
        skillId: "",
        video_link: "",
      };
      await addDoc(collection(db, "Courses"), volunteer);
      getVolunteer();
      notification.success({
        message: "Success",
        description: "Volunteer added successfully!",
      });
      createNewVolunteer.resetFields();
      setIsAddNewVolunteerModal(false);
    } catch (error) {
      console.log("🚀 ~ handelCreateVolunteer ~ error:", error);
      notification.error({
        message: "Error",
        description: "Failed to add volunteer. Please try again later.",
      });
    }
  };
  useEffect(() => {
    getSuggestiveList();
    getWelfare();
    getDocuments();
    getSubscriptionPlans();
    getSkilling();
    getVolunteer();
  }, []);

  const tabItems = [
    {
      label: `Trades`,
      key: "Trades",
      children: (
        <div className="m-3">
          <div className="my-5 flex justify-end">
            {isEditing ? (
              <Button type="primary" onClick={() => setIsEditing(false)}>
                Add
              </Button>
            ) : (
              <Button type="primary" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>
          <div className="">
            {!isEditing && (
              <Form
                form={suggestiveForm}
                onFinish={(values) =>
                  createSuggestiveList(values?.benefit, "Trades")
                }
              >
                <Form.Item
                  name="benefit"
                  rules={[
                    {
                      required: true,
                      message: "Benefit Name is required",
                    },
                  ]}
                >
                  <Input placeholder="Benefit Name" />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit">Save</Button>
                </Form.Item>
              </Form>
            )}
          </div>
          <div className="flex items-center gap-3 m-3 flex-wrap">
            {suggestiveList?.Trades?.map((trade) => {
              return (
                <div
                  className="flex items-center justify-center bg-primary px-3 py-2 rounded-full"
                  key={trade?.id}
                >
                  <p className="text-sm font-semibold text-white">
                    {trade?.name}
                  </p>
                  {isEditing && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() =>
                        deleteSuggestiveList(trade?.id, trade?.name)
                      }
                    >
                      <XIcon className="text-white" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      label: `Skills`,
      key: "Skills",
      children: (
        <div className="m-3">
          <div className="my-5 flex justify-end">
            {isEditing ? (
              <Button type="primary" onClick={() => setIsEditing(false)}>
                Add
              </Button>
            ) : (
              <Button type="primary" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>
          <div className="">
            {!isEditing && (
              <Form
                form={suggestiveForm}
                onFinish={(values) =>
                  createSuggestiveList(values?.benefit, "Skills")
                }
              >
                <Form.Item
                  name="benefit"
                  rules={[
                    {
                      required: true,
                      message: "Benefit Name is required",
                    },
                  ]}
                >
                  <Input placeholder="Benefit Name" />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit">Save</Button>
                </Form.Item>
              </Form>
            )}
          </div>
          <div className="flex items-center gap-3 m-3 flex-wrap">
            {suggestiveList?.Skills?.map((trade) => {
              return (
                <div
                  className="flex items-center justify-center bg-primary px-3 py-2 rounded-full"
                  key={trade?.id}
                >
                  <p className="text-sm font-semibold text-white">
                    {trade?.name}
                  </p>
                  {isEditing && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() =>
                        deleteSuggestiveList(trade?.id, trade?.name)
                      }
                    >
                      <XIcon className="text-white" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      label: `Other Benefits`,
      key: "Other Benefits",
      // children: `Content of Tab ${id}`,
      children: (
        <div className="m-3">
          <div className="my-5 flex justify-end">
            {isEditing ? (
              <Button type="primary" onClick={() => setIsEditing(false)}>
                Add
              </Button>
            ) : (
              <Button type="primary" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>
          <div className="">
            {!isEditing && (
              <Form
                form={suggestiveForm}
                onFinish={(values) =>
                  createSuggestiveList(values?.benefit, "Other Benefits")
                }
              >
                <Form.Item
                  name="benefit"
                  rules={[
                    {
                      required: true,
                      message: "Benefit Name is required",
                    },
                  ]}
                >
                  <Input placeholder="Benefit Name" />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit">Save</Button>
                </Form.Item>
              </Form>
            )}
          </div>
          <div className="flex items-center gap-3 m-3 flex-wrap">
            {suggestiveList["Other Benefits"]?.map((trade) => {
              return (
                <div
                  className="flex items-center justify-center bg-primary px-3 py-2 rounded-full"
                  key={trade?.id}
                >
                  <p className="text-sm font-semibold text-white">
                    {trade?.name}
                  </p>
                  {isEditing && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() =>
                        deleteSuggestiveList(trade?.id, trade?.name)
                      }
                    >
                      <XIcon className="text-white" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ),
    },
  ];
  const SessionForm = ({ courseId, session, onUpdate }) => {
    const [session1, setSession1] = useState(session.name_1 || "");
    const [session2, setSession2] = useState(session.name_2 || "");

    const handleUpdate = async () => {
      try {
        await updateDoc(doc(db, "Courses", courseId), {
          session: {
            name_1: session1,
            name_2: session2,
          },
        });
        console.log(`Sessions updated successfully for course ${courseId}`);
      } catch (error) {
        console.error("Error updating sessions:", error);
      }
    };

    return (
      <div>
        <div className="flex gap-5">
          <Card title="Session 1">
            <Input
              value={session1}
              onChange={(e) => setSession1(e.target.value)}
              placeholder="Session 1 Name"
            />
          </Card>
          <Card title="Session 2">
            <Input
              value={session2}
              onChange={(e) => setSession2(e.target.value)}
              placeholder="Session 2 Name"
              style={{ marginLeft: "10px" }}
            />
          </Card>
        </div>
        <Button type="primary" onClick={handleUpdate} className="mt-4">
          Update Sessions
        </Button>
      </div>
    );
  };

  return (
    <div className="p-5">
      <div>
        <p className="text-base mb-5">
          Dashboard <span className="text-[#F7B652]">&gt;</span> New
          Registration List
        </p>
        <span className="text-2xl font-semibold text-[#013D9D]">Services</span>
      </div>
      <Tabs centered>
        <TabPane
          tab={<span className="font-semibold">Job Post</span>}
          key="1"
          className="p-4 mx-auto"
        >
          <div>
            <Form
              name="companyDetailsForm"
              layout="vertical"
              form={companyForm}
              onFinish={handelCreateJobPost}
            >
              <h1 className="text-lg font-medium text-[#013D9D] mb-8 ml-32">
                Company Details
              </h1>
              <div className="grid grid-cols-3 gap-2 w-[80%] mx-auto">
                <Form.Item
                  label="Company Name"
                  name="companyName"
                  className="w-full mb-2"
                  rules={[
                    {
                      required: true,
                      message: "Company Name is required",
                    },
                    {
                      whitespace: true,
                      message: "Company Name is required",
                    },
                  ]}
                >
                  <Input placeholder="Enter Company Name" />
                </Form.Item>
                <Form.Item
                  label="Company GSTIN No"
                  name="companyGstin"
                  className="w-full mb-2"
                >
                  <Input placeholder="Enter GST Number" />
                </Form.Item>
                <Form.Item
                  name="companyPan"
                  label="Company Pan Card No"
                  className="mb-2"
                >
                  <Input placeholder="Enter PAN number" />
                </Form.Item>
                <Form.Item
                  name="companyPin"
                  label="PIN"
                  className="mb-2"
                  rules={[
                    {
                      required: true,
                      message: "PIN is required",
                    },
                    {
                      whitespace: true,
                      message: "PIN is required",
                    },
                  ]}
                >
                  <Input placeholder="Eg. 741234" type="number" />
                </Form.Item>
                <Form.Item
                  name="companyState"
                  label="State"
                  className="mb-2"
                  rules={[
                    {
                      required: true,
                      message: "State is required",
                    },
                    {
                      whitespace: true,
                      message: "State is required",
                    },
                  ]}
                >
                  <Input placeholder="Eg. Hyderabad" />
                </Form.Item>
                <Form.Item
                  name="companyAddress"
                  label="Registered Address"
                  className=""
                  rules={[
                    {
                      required: true,
                      message: "Registered Address is required",
                    },
                    {
                      whitespace: true,
                      message: "Registered Address is required",
                    },
                  ]}
                >
                  <Input placeholder="Eg. 24 Bombay House" />
                </Form.Item>
                <Form.Item
                  name="email"
                  label="Email"
                  className=""
                  rules={[
                    {
                      required: true,
                      message: "Email is required",
                    },
                    {
                      whitespace: true,
                      message: "Email is required",
                    },
                  ]}
                >
                  <Input placeholder="Eg. 24 Bombay House" />
                </Form.Item>
                <Form.Item
                  name="phone"
                  label="Phone"
                  className=""
                  rules={[
                    {
                      required: true,
                      message: "Phone is required",
                    },
                    {
                      whitespace: true,
                      message: "Phone is required",
                    },
                  ]}
                >
                  <Input placeholder="+917837432342" />
                </Form.Item>
              </div>

              <h1 className="text-lg font-medium text-[#013D9D] mb-4 ml-32">
                Job Details
              </h1>
              <div className="grid grid-cols-3 gap-2 w-[80%] mx-auto">
                <Form.Item
                  label="Job Position"
                  name="jobPosition"
                  className="w-full mb-2"
                  rules={[
                    {
                      required: true,
                      message: "Job Position is required",
                    },
                    {
                      whitespace: true,
                      message: "Job Position is required",
                    },
                  ]}
                >
                  <Input placeholder="Eg. Technician" />
                </Form.Item>
                <Form.Item
                  label="Education Qualification"
                  name="educationQualification"
                  className="w-full mb-2"
                  rules={[
                    {
                      required: true,
                      message: "Education Qualification is required",
                    },
                    {
                      whitespace: true,
                      message: "Education Qualification is required",
                    },
                  ]}
                >
                  <Select
                    placeholder="Choose from dropdown"
                    style={{
                      flex: 1,
                    }}
                  >
                    <Option value="5th pass">5th pass</Option>
                    <Option value="8th pass">8th pass</Option>
                    <Option value="10th pass">10th pass</Option>
                    <Option value="12th pass">12th pass</Option>
                    <Option value="12th Science">12th Science</Option>
                    <Option value="ITI">ITI</Option>
                    <Option value="Diploma">Diploma</Option>
                    <Option value="Polytechnic">Polytechnic</Option>
                    <Option value="BE / Btech">BE / Btech</Option>
                    <Option value="BA">BA</Option>
                    <Option value="BSC">BSC</Option>
                    <Option value="MBA">MBA</Option>
                    <Option value="MA">MA</Option>
                    <Option value="PHD">PHD</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="jobPlace"
                  label="Job Place"
                  className="mb-2"
                  rules={[
                    {
                      required: true,
                      message: "Job Place is required",
                    },
                  ]}
                >
                  <Select
                    placeholder="Place"
                    mode="tags"
                    style={{
                      flex: 1,
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="experienceRequired"
                  label="Experience Required"
                  className="mb-2"
                  rules={[
                    {
                      required: true,
                      message: "Experience Required is required",
                    },
                  ]}
                >
                  <Select
                    placeholder="Experience"
                    style={{
                      flex: 1,
                    }}
                    options={[
                      {
                        value: "Any",
                        label: "Any",
                      },
                      {
                        value: "Fresher",
                        label: "Fresher",
                      },
                      {
                        value: "Experience",
                        label: "Experience",
                      },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  name="skillRequired"
                  label="Skill Required"
                  className="mb-2"
                  rules={[
                    {
                      required: true,
                      message: "Skill Required is required",
                    },
                  ]}
                >
                  <Select
                    placeholder="skillRequired"
                    mode="multiple"
                    style={{
                      flex: 1,
                    }}
                  >
                    {suggestiveList?.Skills?.map((op) => {
                      return (
                        <Option value={op?.name} key={op?.id}>
                          {op?.name}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="numberOfOpenings"
                  label="Number of Openings"
                  className="mb-2"
                  rules={[
                    {
                      required: true,
                      message: "Number of Openings is required",
                    },
                    {
                      whitespace: true,
                      message: "Number of Openings is required",
                    },
                  ]}
                >
                  <Input placeholder="Eg.100" />
                </Form.Item>
                <div className="flex items-center justify-center gap-2">
                  <Form.Item
                    name="payout_from"
                    label="Payout From"
                    className="mb-2"
                    rules={[
                      {
                        required: true,
                        message: "Payout is required",
                      },
                    ]}
                  >
                    <Input placeholder="Eg.741234" type="number" />
                  </Form.Item>{" "}
                  <p>To</p>
                  <Form.Item
                    label="Payout To"
                    name="payout_to"
                    className="mb-2"
                    rules={[
                      {
                        required: true,
                        message: "Payout is required",
                      },
                    ]}
                  >
                    <Input placeholder="Eg.741234" type="number" />
                  </Form.Item>
                </div>
                <Form.Item
                  name="otherBenefits"
                  label="Other Benefits"
                  className="mb-2"
                >
                  <Select
                    placeholder="Other Benefits"
                    mode="tags"
                    style={{
                      flex: 1,
                    }}
                  >
                    {suggestiveList["Other Benefits"]?.map((op) => {
                      return (
                        <Option value={op?.name} key={op?.id}>
                          {op?.name}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </div>
              <div className="flex justify-end gap-8">
                <Button className="px-8 py-2">Cancel</Button>
                <Button
                  className="px-8 py-2 bg-[#013D9D] text-white"
                  htmlType="submit"
                >
                  Post
                </Button>
              </div>
            </Form>
          </div>
        </TabPane>
        <TabPane
          //  tab="Skilling"
          tab={<span className="font-semibold">Skilling</span>}
          key="2"
        >
          <div className="flex justify-end">
            {selectedSkill && (
              <Button
                type="primary"
                className="mr-3"
                onClick={() => setIsSkillingModalVisible(true)}
              >
                Add New Course
              </Button>
            )}
            <Button type="primary" onClick={() => setIsSkillingModal(true)}>
              Add New Skilling
            </Button>
          </div>
          <div className=" max-w-screen-xl mt-7 mx-auto">
            <Form
              form={skillingForm}
              layout="vertical"
              onFinish={handleFormSubmit}
            >
              <Form.Item
                label="Select Skill"
                name="skill"
                rules={[{ required: true, message: "Please select a skill" }]}
              >
                <Select
                  placeholder="Select a skill"
                  onChange={handleSkillChange}
                  value={selectedSkill?.id}
                >
                  {skilling.map((skill) => (
                    <Option key={skill.id} value={skill.id}>
                      {skill.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              {/* 
              <Form.Item
                label="Program Name"
                name="programName"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: "Program Name is required",
                  },
                ]}
              >
                <Input placeholder="Enter Program Name" />
              </Form.Item> */}

              {selectedSkill &&
                selectedSkill.courses.map((course, index) => (
                  <div key={course.id} className="course-item">
                    <Divider>Course {index + 1}</Divider>
                    <div className="grid grid-cols-3 gap-5">
                      <Form.Item
                        label="Course Name"
                        name={`courseName${index}`}
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: "Course Name is required",
                          },
                        ]}
                      >
                        <Input placeholder="Enter course Name" />
                      </Form.Item>
                      <Form.Item
                        label="Course Video Link"
                        name={`video_link${index}`}
                        rules={[
                          {
                            // required: true,
                            whitespace: true,
                            message: "Course Video Link is required",
                          },
                        ]}
                      >
                        <Input placeholder="Enter Video Link" />
                      </Form.Item>
                      <Form.Item name={`course_id${index}`} hidden>
                        <Input placeholder="Enter Video Link" />
                      </Form.Item>
                      <Form.Item
                        label="Course Type"
                        name={`courseType${index}`}
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: "Course Type is required",
                          },
                        ]}
                      >
                        <Select placeholder="Select">
                          <Option value="free">Free</Option>
                          <Option value="paid">Paid</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item label="Amount" name={`amount${index}`}>
                        <Input placeholder="Amount" type="number" />
                      </Form.Item>
                      <Form.Item label="Location" name={`location${index}`}>
                        <Input placeholder="Location" />
                      </Form.Item>
                    </div>
                  </div>
                ))}

              {selectedSkill && (
                <div className="flex justify-end gap-8 mt-4">
                  <Button type="primary" htmlType="submit">
                    Save
                  </Button>
                </div>
              )}
            </Form>
          </div>
        </TabPane>
        <TabPane
          tab={<span className="font-semibold">Volunteer</span>}
          //  tab=""
          key="3"
        >
          <Modal
            open={isAddNewVolunteerModalVisible}
            onClose={() => setIsAddNewVolunteerModal(false)}
            onCancel={() => setIsAddNewVolunteerModal(false)}
            title="Add New Volunteer"
            footer={null}
          >
            <Form
              form={createNewVolunteer}
              layout="vertical"
              onFinish={handelCreateVolunteer}
            >
              <Form.Item
                name="volunteerName"
                label="Volunteer Name"
                rules={[
                  { required: true, message: "Please enter volunteer name" },
                ]}
              >
                <Input placeholder="Enter volunteer name" />
              </Form.Item>
              <Form.Item
                name="sessionName1"
                label="Session 1 Name"
                rules={[
                  { required: true, message: "Please enter session 1 name" },
                ]}
              >
                <Input placeholder="Enter session 1 name" />
              </Form.Item>
              <Form.Item
                name="sessionName2"
                label="Session 2 Name"
                rules={[
                  { required: true, message: "Please enter session 2 name" },
                ]}
              >
                <Input placeholder="Enter session 2 name" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Add
                </Button>
              </Form.Item>
            </Form>
          </Modal>
          <div>
            <div className="flex justify-end">
              <Button
                onClick={() => setIsAddNewVolunteerModal(true)}
                type="primary"
              >
                Add New Volunteer
              </Button>
            </div>
            <Tabs type="card" tabPosition={"left"}>
              {volunteer?.map((course) => (
                <TabPane tab={course.name} key={course.id}>
                  <SessionForm
                    courseId={course.id}
                    sessionNumber={1}
                    session={course.session}
                    onUpdate={handleSessionUpdate}
                  />
                </TabPane>
              ))}
            </Tabs>
          </div>
        </TabPane>
        <TabPane
          tab={<span className="font-semibold">Document</span>}
          // tab="Document"
          key="4"
        >
          <div className="max-w-4xl mx-auto mt-10">
            <div className="flex justify-between">
              <h1 className="text-[#013D9D] font-semibold text-base">
                Document Services
              </h1>
              {isEditing ? (
                <Button
                  type="primary"
                  className="bg-[#013D9D] text-white"
                  onClick={() => setIsEditing(false)}
                >
                  Add
                </Button>
              ) : (
                <Button
                  className="bg-[#013D9D] text-white"
                  onClick={() => setIsEditing(true)}
                >
                  <EditOutlined />
                  Edit
                </Button>
              )}
            </div>
            {!isEditing && (
              <Form
                className="mt-4"
                form={documentService}
                onFinish={(values) =>
                  createDocument(values?.document, values?.amount)
                }
              >
                <Form.Item
                  name="document"
                  rules={[
                    {
                      required: true,
                      message: "Document Name is required",
                    },
                  ]}
                >
                  <Input placeholder="Document Name" />
                </Form.Item>
                <Form.Item
                  name="amount"
                  rules={[
                    {
                      required: true,
                      message: "Amount is required",
                    },
                  ]}
                >
                  <Input placeholder="Amount" type="number" />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit">Save</Button>
                </Form.Item>
              </Form>
            )}
            <div className="flex gap-3 mt-5 flex-wrap">
              {documents?.map((document) => {
                return (
                  <p className="bg-primary px-3 py-2 rounded-full text-white font-semibold items-center justify-between flex flex-nowrap">
                    {document?.name}
                    {isEditing && (
                      <Button
                        type="link"
                        size="small"
                        onClick={() =>
                          deleteDocument(document?.id, document?.name)
                        }
                      >
                        <XIcon className="text-white" />
                      </Button>
                    )}
                  </p>
                );
              })}
            </div>
          </div>
        </TabPane>
        <TabPane
          tab={<span className="font-semibold">Welfare Scheme</span>}
          key="5"
        >
          <div className="max-w-4xl mx-auto mt-10">
            <div className="flex justify-between">
              <h1 className="text-[#013D9D] font-semibold text-base">
                Welfare Schemes
              </h1>
              {isEditing ? (
                <Button
                  type="primary"
                  className="bg-[#013D9D] text-white"
                  onClick={() => setIsEditing(false)}
                >
                  Add
                </Button>
              ) : (
                <Button
                  className="bg-[#013D9D] text-white"
                  onClick={() => setIsEditing(true)}
                >
                  <EditOutlined />
                  Edit
                </Button>
              )}
            </div>

            {!isEditing && (
              <Form
                className="mt-4"
                form={welfareForm}
                onFinish={(values) =>
                  createScheme(values?.scheme, values?.amount)
                }
              >
                <Form.Item
                  name="scheme"
                  rules={[
                    {
                      required: true,
                      message: "Benefit Name is required",
                    },
                  ]}
                >
                  <Input placeholder="Benefit Name" />
                </Form.Item>
                <Form.Item
                  name="amount"
                  rules={[
                    {
                      required: true,
                      message: "Amount is required",
                    },
                  ]}
                >
                  <Input placeholder="Amount" type="number" />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit">Save</Button>
                </Form.Item>
              </Form>
            )}

            <div className="flex gap-3 mt-5 flex-wrap">
              {welfareList?.map((welfare) => {
                return (
                  <p className="bg-primary px-3 py-2 rounded-full text-white font-semibold items-center justify-between flex flex-nowrap">
                    {welfare?.name}
                    {isEditing && (
                      <Button
                        type="link"
                        size="small"
                        onClick={() =>
                          deleteWelfareSchemes(welfare?.id, welfare?.name)
                        }
                      >
                        <XIcon className="text-white" />
                      </Button>
                    )}
                  </p>
                );
              })}
            </div>
          </div>
        </TabPane>
        <TabPane
        //  tab="Subscription Plan" 
          tab={<span className="font-semibold">Subscription Plan</span>}
        
        key="6">
          <div className="flex justify-end mb-4">
            <Button type="primary" onClick={() => setIsModalVisible(true)}>
              Create New Benefit
            </Button>
          </div>
          <Tabs
            className="w-full"
            tabPosition={"left"}
            items={subscriptionTabs}
          />
        </TabPane>
        <TabPane
          // tab="Suggestive Lists"
          tab={<span className="font-semibold">Suggestive Lists</span>}

          key="7"
          className="w-[80%] flex items-center justify-center mx-auto"
        >
          <Tabs
            className="w-full"
            activeKey={tab}
            tabPosition={"left"}
            items={tabItems}
            onChange={(t) => setTab(t)}
          />
        </TabPane>
      </Tabs>
      <Modal
        title="Create New Benefit"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={createSubscriptionForm}
          layout="vertical"
          className="flex  gap-10"
          onFinish={handleCreateSubscriptionPlan}
        >
          <div>
            <Form.List
              name="benefits"
              rules={[
                {
                  validator: async (_, benefits) => {
                    if (!benefits || benefits.length < 1) {
                      return Promise.reject(
                        new Error("At least 1 benefit is required.")
                      );
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <div className="flex flex-col w-80">
                  {fields.map((field, index) => (
                    <Form.Item
                      className="w-full"
                      label={index === 0 ? "Benefits" : ""}
                      required={false}
                      key={field.key}
                    >
                      <div className="flex flow-row gap-2 items-center justify-center">
                        <Form.Item
                          className="w-full"
                          {...field}
                          validateTrigger={["onChange", "onBlur"]}
                          rules={[
                            {
                              required: true,
                              whitespace: true,
                              message:
                                "Please input benefit name or delete this field.",
                            },
                          ]}
                          noStyle
                        >
                          <Input placeholder="Benefit name" />
                        </Form.Item>
                        {fields.length > 1 ? (
                          <MinusCircle
                            className="dynamic-delete-button text-red-500"
                            onClick={() => remove(field.name)}
                          />
                        ) : null}
                      </div>
                    </Form.Item>
                  ))}

                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                    >
                      Add field
                    </Button>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                </div>
              )}
            </Form.List>
          </div>
          <div className="w-full">
            <Form.Item
              label="Plan Tenure"
              name="plan_tenure"
              rules={[
                {
                  required: true,
                  message: "Please select plan tenure",
                },
              ]}
            >
              <Select>
                <Option value="Monthly">Monthly</Option>
                <Option value="Yearly">Yearly</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Plan Name"
              name="plan_name"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Please input plan name",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Price (₹)"
              name="plan_price"
              rules={[
                {
                  required: true,

                  message: "Please input plan price",
                },
              ]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item className="flex justify-end">
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Modal>
      <Modal
        title="Create New Skilling"
        open={isSkillingModal}
        onCancel={() => setIsSkillingModal(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Program Name"
            name="programName"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Program Name is required",
              },
            ]}
          >
            <Input placeholder="Enter Program Name" />
          </Form.Item>
          {courses.map((course, index) => (
            <div key={course.key} className="course-item">
              <Divider>Course {index + 1}</Divider>
              <div className="grid grid-cols-3 gap-5">
                <Form.Item
                  label="Course Name"
                  name={`courseName${course.key}`}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: "Course Name is required",
                    },
                  ]}
                >
                  <Input placeholder="Enter course Name" />
                </Form.Item>
                <Form.Item
                  label="Course Video Link"
                  name={`courseVideoLink${course.key}`}
                  rules={[
                    {
                      // required: true,
                      whitespace: true,
                      message: "Course Video Link is required",
                    },
                  ]}
                >
                  <Input placeholder="Enter Video Link" />
                </Form.Item>
                <Form.Item
                  label="Course Type"
                  name={`courseType${course.key}`}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: "Course Fee is required",
                    },
                  ]}
                >
                  <Select placeholder="Select">
                    <Option value="free">Free</Option>
                    <Option value="paid">Paid</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Amount" name={`amount${index}`}>
                  <Input placeholder="Amount" type="number" />
                </Form.Item>
                <Form.Item label="Location" name={`location${index}`}>
                  <Input placeholder="Location" />
                </Form.Item>
              </div>
              {courses.length > 1 && (
                <Button type="link" onClick={() => removeCourse(course.key)}>
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button type="dashed" onClick={addCourse} icon={<PlusOutlined />}>
            Add Course
          </Button>
          <div className="flex justify-end gap-8 mt-4">
            <Button>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </div>
        </Form>
      </Modal>
      <Modal
        title="Add Course"
        open={isSkillingModalVisible}
        onCancel={() => setIsSkillingModalVisible(false)}
        footer={null}
      >
        <Form
          form={addNewCourseForm}
          layout="vertical"
          onFinish={handleAddCourse}
        >
          <Form.Item
            label="Course Name"
            name="courseName"
            rules={[{ required: true, message: "Course Name is required" }]}
          >
            <Input placeholder="Enter course name" />
          </Form.Item>
          <Form.Item
            label="Course Video Link"
            name="courseVideoLink"
            rules={[
              { whitespace: true, message: "Course Video Link is required" },
            ]}
          >
            <Input placeholder="Enter video link" />
          </Form.Item>
          <Form.Item
            label="Course Type"
            name="courseType"
            rules={[{ required: true, message: "Course Type is required" }]}
          >
            <Select placeholder="Select course type">
              <Option value="free">Free</Option>
              <Option value="paid">Paid</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Amount" name={`amount`}>
            <Input placeholder="Amount" type="number" />
          </Form.Item>
          <Form.Item
            label="Location"
            name="location"
            rules={[{ whitespace: true, message: "location is required" }]}
          >
            <Input placeholder="Enter video link" />
          </Form.Item>
          <div className="flex justify-end gap-8 mt-4">
            <Button onClick={() => setIsSkillingModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Add Course
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Index;
