"use client";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    UncontrolledFormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PHONE_REGEX_THAI } from "@/constants/constant";
import { useToast } from "@/hooks/use-toast-notification";
import { updateCandidateDataProps } from "@/domains/candidates/services/server/actions/candidate-data";
import { updateUserDataProps } from "@/domains/authentication/services/server/actions/user-data";
import { auth, getFirebaseAuth } from "@/lib/firebase";
import { userAtom } from "@/store/atom-store";
import type { userDataProps } from "@/types/auth.types";
import type { candidateDataProps } from "@/types/candidate.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfile } from "firebase/auth";
import { useSetAtom } from "jotai";
import Image from "next/image";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
    type Address,
    CreateInput,
} from "thai-address-autocomplete-react";
import * as z from "zod";
import AvatarPlaceholder from "../media/avatar-placeholder";
import ImageUploader from "../media/image-uploader";

const InputThaiAddress = CreateInput();

const ProfileEditorFormSchema = z.object({
  avatar: z.string(),
  firstnameTH: z
    .string()
    .min(2, {
      message: "ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร",
    })
    .max(100, {
      message: "ชื่อต้องมีความยาวไม่เกิน 100 ตัวอักษร",
    }),
  lastnameTH: z
    .string()
    .min(2, {
      message: "ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร",
    })
    .max(100, {
      message: "ชื่อต้องมีความยาวไม่เกิน 100 ตัวอักษร",
    }),
  phone: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .regex(PHONE_REGEX_THAI, "หมายเลขโทรศัพท์ไม่ถูกต้อง")
    .max(15, { message: "ความยาวหมายเลขโทรศัพท์ไม่ถูกต้อง" }),
  email: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .email("รูปแบบอีเมลไม่ถูกต้อง"),
  address: z
    .object({
      addressLine1: z
        .string({
          description: "ที่อยู่",
          required_error: "กรุณากรอกที่อยู่",
          invalid_type_error: "กรุณากรอกที่อยู่",
        })
        .min(1, { message: "กรุณากรอกที่อยู่" })
        .max(1000),
      subDistrict: z
        .string({
          required_error: "กรุณาระบุตำบล",
          invalid_type_error: "กรุณาระบุตำบล",
        })
        .min(1, { message: "กรุณาระบุตำบล" }),
      district: z
        .string({
          required_error: "กรุณากรอกอำเภอ",
          invalid_type_error: "กรุณากรอกอำเภอ",
        })
        .min(1, { message: "กรุณากรอกข้อมูล" }),
      province: z
        .string({
          required_error: "กรุณากรอกจังหวัด",
          invalid_type_error: "กรุณากรอกจังหวัด",
        })
        .min(1, { message: "กรุณากรอกจังหวัด" }),
      postCode: z
        .string({
          required_error: "กรุณากรอกรหัสไปรษณีย์",
          invalid_type_error: "กรุณากรอกรหัสไปรษณีย์",
        })
        .min(1, { message: "กรุณากรอกรหัสไปรษณีย์" }),
    })
    .superRefine((data, ctx) => {
      if (
        !data.district ||
        !data.postCode ||
        !data.province ||
        !data.subDistrict
      ) {
        ctx.addIssue({
          code: "custom",
          message: "กรุณาเลือกข้อมูลจากรายการ",
        });
      } else {
        const subDistrict = z
          .string({
            required_error: "กรุณาระบุตำบล",
            invalid_type_error: "กรุณาระบุตำบล",
          })
          .min(1, { message: "กรุณาระบุตำบล" })
          .safeParse(data.subDistrict);
        if (!subDistrict.success) {
          subDistrict.error.issues.forEach((issue) => {
            console.log("subDistrict.error.issues", issue.message);
            ctx.addIssue({
              code: "custom",
              message: issue.message,
            });
          });
        }
        const district = z
          .string({
            required_error: "กรุณากรอกอำเภอ",
            invalid_type_error: "กรุณากรอกอำเภอ",
          })
          .min(1, { message: "กรุณากรอกข้อมูล" })
          .safeParse(data.district);
        if (!district.success) {
          district.error.issues.forEach((issue) => {
            console.log("district.error.issues", issue.message);
            ctx.addIssue({
              code: "custom",
              message: issue.message,
            });
          });
        }
        const province = z
          .string({
            required_error: "กรุณากรอกจังหวัด",
            invalid_type_error: "กรุณากรอกจังหวัด",
          })
          .min(1, { message: "กรุณากรอกจังหวัด" })
          .safeParse(data.province);
        if (!province.success) {
          province.error.issues.forEach((issue) => {
            console.log("province.error.issues", issue.message);
            ctx.addIssue({
              code: "custom",
              message: issue.message,
            });
          });
        }
        const postCode = z
          .string({
            required_error: "กรุณากรอกรหัสไปรษณีย์",
            invalid_type_error: "กรุณากรอกรหัสไปรษณีย์",
          })
          .min(1, { message: "กรุณากรอกรหัสไปรษณีย์" })
          .safeParse(data.postCode);
        if (!postCode.success) {
          postCode.error.issues.forEach((issue) => {
            console.log("postCode.error.issues", issue.message);
            ctx.addIssue({
              code: "custom",
              message: issue.message,
            });
          });
        }
      }
    }),
});

const ProfileEditor = ({
  userContext,
  candidateContext,
}: { userContext: userDataProps; candidateContext: candidateDataProps }) => {
  const { addToast } = useToast();
  const setUser = useSetAtom(userAtom);
  const [userImage, setUserImage] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (userContext?.avatarURL) {
      setUserImage(userContext?.avatarURL);
    }
  }, [userContext?.avatarURL]);

  const form = useForm<z.infer<typeof ProfileEditorFormSchema>>({
    resolver: zodResolver(ProfileEditorFormSchema),
    defaultValues: {
      avatar: userContext?.avatarURL || "",
      firstnameTH: userContext?.firstnameTH || "",
      lastnameTH: userContext?.lastnameTH || "",
      phone: userContext?.phone?.replace(/^\+66/g, "0") || "",
      email: userContext?.email || "",
      address: {
        addressLine1: candidateContext?.addressLine1 || "",
        subDistrict: candidateContext?.subDistrict || "",
        district: candidateContext?.district || "",
        province: candidateContext?.province || "",
        postCode: candidateContext?.postCode || "",
      },
    },
  });

  const onSubmit = useCallback(
    async (_data: z.infer<typeof ProfileEditorFormSchema>) => {
      console.log("ดำเนินการบันทึกข้อมูล");
      setIsLoading(true);
      if (userImage && auth.currentUser) {
        console.log("มีรูปภาพ => อัพเดทรูปภาพ");
        updateProfile(auth.currentUser, {
          photoURL: userImage,
        })
          .then(() => {
            setUser(auth.currentUser);
            console.log("อัพเดทรูปภาพเสร็จสิ้น");
          })
          .catch((err) => {
            console.error("Firebase profile update failed.", err);
          });
      }
      if (userContext) {
        const boardingChecked = {
          ...userContext,
          avatarURL: userImage,
          firstnameTH: _data.firstnameTH,
          lastnameTH: _data.lastnameTH,
          phone: _data.phone,
          email: _data.email,
          info: userContext.info,
          addressLine1: _data.address?.addressLine1,
          addressLine2: "",
          subDistrict: _data.address?.subDistrict,
          district: _data.address?.district,
          province: _data.address?.province,
          postCode: _data.address?.postCode,
        };

        const user = getFirebaseAuth().currentUser;

        const token = await user?.getIdToken().catch((err) => {
          console.log("err cannot get Id Token", err);
          window.location.href = "/auth/sign-in";
        });
        if (!token) {
          console.log("User not logged in");
          window.location.href = "/auth/sign-in";
          return;
        }
        try {
          if (user) {
            console.log("บันทึกข้อมูล", boardingChecked);
            await updateCandidateDataProps(user?.uid, {
              ...candidateContext,
              addressLine1: _data.address?.addressLine1 || "",
              subDistrict: _data.address?.subDistrict || "",
              district: _data.address?.district || "",
              province: _data.address?.province || "",
              postCode: _data.address?.postCode || "",
            });
            3;
            await updateUserDataProps(user?.uid, {
              ...userContext,
              avatarURL: userImage || "",
              firstnameTH: _data.firstnameTH,
              lastnameTH: _data.lastnameTH,
              phone: _data.phone,
              email: _data.email,
            });

            setIsLoading(false);
            addToast("บันทึกข้อมูลเสร็จสิ้น", "success");
          } else {
            window.location.href = "/auth/sign-in";
          }
        } catch (err) {
          addToast("บันทึกข้อมูลไม่สำเร็จ", "error");
          console.error(err);
          setIsLoading(false);
        }
      }
    },
    [userContext, auth.currentUser, userImage],
  );

  const checkKeyDown = (
    e: React.KeyboardEvent<
      HTMLFormElement | HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    e.key === "Enter" && e.preventDefault();
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-6 p-6">
      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full flex-row items-start justify-start">
          <Label htmlFor="qualification" className="text-lg font-bold">
            ข้อมูลส่วนตัว
          </Label>
        </div>
        <div className="flex w-full items-start gap-6 rounded-lg border p-4">
          <div className="relative flex size-[52px] shrink-0 flex-col items-center justify-start overflow-hidden rounded-sm">
            {userImage ? (
              <Image
                src={userImage}
                alt="User image"
                className="relative mx-auto h-[52px] w-[52px] rounded-full object-cover"
                width={52}
                height={52}
                style={{ objectFit: "cover" }}
              />
            ) : (
              <AvatarPlaceholder size={52} />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-sm font-bold">Profile picture</div>
            <div className="flex gap-2 p-0">
              <ImageUploader
                image={userImage}
                setImage={setUserImage}
                loading={isLoading}
                setLoading={setIsLoading}
                label="Upload your profile picture"
              >
                <Button size={"sm"} variant="outline" className="h-6 text-xs">
                  <Image
                    src={"/images/share-outline.svg"}
                    alt="share outline icon png"
                    className="mr-1 size-4"
                    width={16}
                    height={16}
                  />
                  {`Replace image`}
                </Button>
              </ImageUploader>
              <Button
                size={"sm"}
                onClick={() => setUserImage(undefined)}
                variant="outline"
                className="h-6 text-xs"
                disabled={userImage === undefined}
              >
                {`Remove`}
              </Button>
            </div>
            <div className="text-xs text-neutral-500">
              JPG, GIF or PNG. Max size of 20MB
            </div>
          </div>
        </div>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (err) => console.error(err))}
          onKeyDown={checkKeyDown}
          className="flex w-full flex-col gap-8"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstnameTH"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อ (First Name)</FormLabel>
                  <FormControl>
                    <Input
                      className="placeholder:text-neutral-500"
                      placeholder="First name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="w-40 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastnameTH"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>นามสกุล (Last Name)</FormLabel>
                  <FormControl>
                    <Input
                      className="placeholder:text-neutral-500"
                      placeholder="Last name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="w-40 text-xs" />
                </FormItem>
              )}
            />

            <div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>อีเมล (Email)</FormLabel>
                    <FormControl>
                      <Input
                        className="placeholder:text-neutral-500"
                        placeholder="email@domain.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="w-40 text-xs" />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เบอร์โทรศัพท์ (Telephone Number)</FormLabel>
                    <FormControl>
                      <Input
                        className="placeholder:text-neutral-500"
                        placeholder="08xxxxxxxx"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="w-40 text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-base mb-2">
                    ที่อยู่ (Address)
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Input
                          type="text"
                          value={field.value.addressLine1 || ""}
                          placeholder="บ้านเลขที่ / หมู่บ้าน / ถนน"
                          onChange={(e) => {
                            field.onChange({
                              ...field.value,
                              addressLine1: e.target.value,
                            });
                          }}
                        />
                      </div>
                      <div>
                        <div className="mb-1">
                          <FormLabel htmlFor="sub_district" className="mb-3">
                            ตำบล (Sub District)
                          </FormLabel>
                          <InputThaiAddress.District
                            className="w-full rounded-lg border border-gray-300 p-2.5 mt-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-950 dark:text-white"
                            value={field.value.subDistrict}
                            onChange={(value: string) => {
                              field.onChange({
                                ...field.value,
                                subDistrict: value,
                              });
                            }}
                            onSelect={(address: Address) => {
                              field.onChange({
                                ...field.value,
                                subDistrict: address.district,
                                district: address.amphoe,
                                province: address.province,
                                postCode: String(address.zipcode),
                              });
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="mb-1">
                          <FormLabel htmlFor="district" className="mb-3">
                            อำเภอ (District)
                          </FormLabel>
                        </div>
                        <InputThaiAddress.Amphoe
                          className="w-full rounded-lg border border-gray-300 p-2.5 mt-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-950 dark:text-white"
                          value={field.value.district}
                          onChange={(value: string) => {
                            field.onChange({
                              ...field.value,
                              district: value,
                            });
                          }}
                          onSelect={(address: Address) => {
                            field.onChange({
                              ...field.value,
                              subDistrict: address.district,
                              district: address.amphoe,
                              province: address.province,
                              postCode: String(address.zipcode),
                            });
                          }}
                        />
                      </div>

                      <div>
                        <div className="mb-1">
                          <FormLabel htmlFor="province" className="mb-3">
                            จังหวัด (Province)
                          </FormLabel>
                        </div>
                        <InputThaiAddress.Province
                          className="w-full rounded-lg border border-gray-300 p-2.5 mt-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-950 dark:text-white"
                          value={field.value.province}
                          onChange={(value: string) => {
                            field.onChange({
                              ...field.value,
                              province: value,
                            });
                          }}
                          onSelect={(address: Address) => {
                            field.onChange({
                              ...field.value,
                              subDistrict: address.district,
                              district: address.amphoe,
                              province: address.province,
                              postCode: String(address.zipcode),
                            });
                          }}
                        />
                      </div>

                      <div>
                        <div className="mb-1">
                          <FormLabel htmlFor="postal_code" className="mb-3">
                            รหัสไปรษณีย์ (Postal code)
                          </FormLabel>
                        </div>
                        <InputThaiAddress.Zipcode
                          className="w-full rounded-lg border border-gray-300 p-2.5 mt-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-950 dark:text-white"
                          value={field.value.postCode}
                          onChange={(value: string) => {
                            field.onChange({
                              ...field.value,
                              postCode: value,
                            });
                          }}
                          onSelect={(address: Address) => {
                            field.onChange({
                              ...field.value,
                              subDistrict: address.district,
                              district: address.amphoe,
                              province: address.province,
                              postCode: String(address.zipcode),
                            });
                          }}
                        />
                      </div>
                    </div>
                  </FormControl>
                  {/* <FormMessage /> */}
                  <UncontrolledFormMessage>
                    {form.formState.errors.address?.subDistrict?.message}
                  </UncontrolledFormMessage>
                  <UncontrolledFormMessage>
                    {form.formState.errors.address?.district?.message}
                  </UncontrolledFormMessage>
                  <UncontrolledFormMessage>
                    {form.formState.errors.address?.province?.message}
                  </UncontrolledFormMessage>
                  <UncontrolledFormMessage>
                    {form.formState.errors.address?.postCode?.message}
                  </UncontrolledFormMessage>
                </FormItem>
              )}
            />
          </div>
          <div className="flex w-full justify-end py-4">
            <Button
              size="default"
              type="submit"
              className="px-6"
              disabled={form.formState.isSubmitting}
            >
              บันทึก
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProfileEditor;
